'use client';

import { Navbar } from '@/components/navigation/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ShoppingBag,
    Tag,
    ExternalLink,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Grid3X3,
    List
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
    price: string;
    price_numeric: number;
    url: string;
    item_id: string;
    page_number: number;
    category: string;
    store: string;
    image?: string;
    description?: string;
    rating?: number;
    review_count?: number;
    created_at: string;
}

interface CrawlingSession {
    id: string;
    name: string;
    created_at: string;
    product_count: number;
    status: 'active' | 'completed' | 'failed';
    products?: Product[];
}

export default function ProductsPage() {
    const [sessions, setSessions] = useState<CrawlingSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<CrawlingSession | null>(null);
    const [selectedSessionProducts, setSelectedSessionProducts] = useState<Product[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // 모달 내 필터링 및 페이지네이션 상태
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStore, setSelectedStore] = useState('all');
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [itemsPerPage] = useState(12);

    // 사용자 이메일 가져오기
    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await fetch('/api/auth/check');
                const data = await res.json();
                if (data.isLoggedIn && data.user) {
                    setUserEmail(data.user.email);
                }
            } catch (error) {
                console.error('사용자 확인 실패:', error);
            }
        };
        checkUser();
    }, []);

    // 크롤링 세션 목록 가져오기
    const fetchSessions = async () => {
        if (!userEmail) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/products?userEmail=${encodeURIComponent(userEmail)}`);
            const result = await response.json();

            if (result.success) {
                setSessions(result.data || []);
            } else {
                throw new Error(result.error || '크롤링 세션을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('세션 조회 오류:', err);
            setError(err instanceof Error ? err.message : '크롤링 세션을 불러오는데 실패했습니다.');
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userEmail) {
            fetchSessions();
        }
    }, [userEmail]);

    // 특정 세션의 상품들 가져오기
    const fetchSessionProducts = async (sessionId: string) => {
        try {
            const response = await fetch(`/api/products?sessionId=${sessionId}`);
            const result = await response.json();

            if (result.success) {
                setSelectedSessionProducts(result.data || []);
            } else {
                throw new Error(result.error || '상품을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('상품 조회 오류:', err);
            toast.error('상품을 불러오는데 실패했습니다.');
            setSelectedSessionProducts([]);
        }
    };

    // 세션 클릭 핸들러
    const handleSessionClick = async (session: CrawlingSession) => {
        setSelectedSession(session);
        setIsModalOpen(true);
        // 모달 열릴 때 필터 초기화
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedStore('all');
        setSortBy('created_at');
        setSortOrder('desc');
        setCurrentPage(1);
        await fetchSessionProducts(session.id);
    };

    // 필터링된 상품들
    const filteredProducts = selectedSessionProducts.filter(product => {
        const matchesSearch = searchTerm === '' ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.store.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesStore = selectedStore === 'all' || product.store === selectedStore;

        return matchesSearch && matchesCategory && matchesStore;
    });

    // 정렬된 상품들
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
            case 'price':
                aValue = a.price_numeric;
                bValue = b.price_numeric;
                break;
            case 'rating':
                aValue = a.rating || 0;
                bValue = b.rating || 0;
                break;
            case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
            default:
                aValue = new Date(a.created_at);
                bValue = new Date(b.created_at);
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // 페이지네이션
    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = sortedProducts.slice(startIndex, endIndex);

    // 고유한 카테고리와 스토어 목록
    const categories = ['all', ...Array.from(new Set(selectedSessionProducts.map(p => p.category)))];
    const stores = ['all', ...Array.from(new Set(selectedSessionProducts.map(p => p.store)))];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Clock className="h-4 w-4 text-blue-500" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return '진행 중';
            case 'completed':
                return '완료';
            case 'failed':
                return '실패';
            default:
                return '알 수 없음';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">크롤링 세션</h2>
                    <p className="text-muted-foreground">
                        크롤링된 상품들을 세션별로 확인하고 관리하세요.
                    </p>
                </div>

                {/* 세션 목록 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {error && (
                        <div className="col-span-full">
                            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                                <CardContent className="p-4 text-center">
                                    <p className="text-red-600 dark:text-red-400 text-sm">
                                        {error}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {sessions.length === 0 ? (
                        <div className="col-span-full">
                            <Card>
                                <CardContent className="p-8 text-center">
                                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold mb-2">크롤링 세션이 없습니다</h3>
                                    <p className="text-muted-foreground mb-4">
                                        아직 크롤링된 상품이 없습니다.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        sessions.map((session, index) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                    onClick={() => handleSessionClick(session)}
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg line-clamp-1">{session.name}</CardTitle>
                                            <Badge variant={session.status === 'completed' ? 'default' : session.status === 'failed' ? 'destructive' : 'secondary'}>
                                                {getStatusText(session.status)}
                                            </Badge>
                                        </div>
                                        <CardDescription className="flex items-center gap-2">
                                            {getStatusIcon(session.status)}
                                            <span>{formatDate(session.created_at)}</span>
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">수집된 상품</span>
                                                <span className="text-lg font-bold text-primary">
                                                    {session.product_count}개
                                                </span>
                                            </div>

                                            <Button variant="outline" size="sm" className="w-full">
                                                <Eye className="h-4 w-4 mr-2" />
                                                상품 보기
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* 상품 상세 모달 */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                {selectedSession?.name} - 상품 목록 ({selectedSessionProducts.length}개)
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col h-full">
                            {/* 필터 및 검색 */}
                            <div className="space-y-4 mb-6">
                                {/* 검색 */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="상품명, 설명, 스토어 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                {/* 필터 및 정렬 */}
                                <div className="flex flex-wrap gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        <span className="text-sm font-medium">필터:</span>
                                    </div>

                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="카테고리" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(category => (
                                                <SelectItem key={category} value={category}>
                                                    {category === 'all' ? '전체' : category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedStore} onValueChange={setSelectedStore}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="스토어" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {stores.map(store => (
                                                <SelectItem key={store} value={store}>
                                                    {store === 'all' ? '전체' : store}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue placeholder="정렬" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="created_at">등록일</SelectItem>
                                            <SelectItem value="price">가격</SelectItem>
                                            <SelectItem value="rating">평점</SelectItem>
                                            <SelectItem value="name">이름</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'asc' ? '오름차순' : '내림차순'}
                                    </Button>

                                    <div className="flex items-center gap-2 ml-auto">
                                        <Button
                                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <Grid3X3 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* 결과 정보 */}
                                <div className="text-sm text-muted-foreground">
                                    총 {filteredProducts.length}개 상품 중 {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}개 표시
                                </div>
                            </div>

                            {/* 상품 목록 */}
                            <div className="flex-1 overflow-y-auto">
                                {currentProducts.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-muted-foreground">검색 조건에 맞는 상품이 없습니다.</p>
                                    </div>
                                ) : (
                                    <div className={viewMode === 'grid'
                                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                        : "space-y-4"
                                    }>
                                        {currentProducts.map((product) => (
                                            <Card key={product.id} className={viewMode === 'list' ? 'flex' : 'overflow-hidden'}>
                                                {viewMode === 'list' ? (
                                                    <>
                                                        <div className="relative w-32 h-32 flex-shrink-0">
                                                            <img
                                                                src={product.image || 'https://via.placeholder.com/300x300?text=상품+이미지'}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                            <div className="absolute top-2 right-2 bg-black/50 text-white px-1 py-0.5 rounded text-xs">
                                                                <Tag className="h-2 w-2 inline mr-1" />
                                                                {product.category}
                                                            </div>
                                                        </div>
                                                        <CardContent className="flex-1 p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-semibold line-clamp-2">{product.name}</h4>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(product.url, '_blank');
                                                                    }}
                                                                >
                                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                                    보기
                                                                </Button>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-lg font-bold text-primary">
                                                                        {product.price}
                                                                    </span>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {product.store}
                                                                    </span>
                                                                </div>
                                                                {product.description && (
                                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                                        {product.description}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                                    <span>{product.page_number}페이지</span>
                                                                    {product.rating && (
                                                                        <span>★ {product.rating} ({product.review_count})</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="relative">
                                                            <img
                                                                src={product.image || 'https://via.placeholder.com/300x300?text=상품+이미지'}
                                                                alt={product.name}
                                                                className="w-full h-32 object-cover"
                                                            />
                                                            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                                                <Tag className="h-3 w-3 inline mr-1" />
                                                                {product.category}
                                                            </div>
                                                        </div>

                                                        <CardContent className="p-4">
                                                            <h4 className="font-semibold line-clamp-2 mb-2">{product.name}</h4>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-lg font-bold text-primary">
                                                                        {product.price}
                                                                    </span>
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {product.store}
                                                                    </span>
                                                                </div>

                                                                {product.description && (
                                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                                        {product.description}
                                                                    </p>
                                                                )}

                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {product.page_number}페이지
                                                                    </span>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            window.open(product.url, '_blank');
                                                                        }}
                                                                    >
                                                                        <ExternalLink className="h-3 w-3 mr-1" />
                                                                        보기
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 페이지네이션 */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                    <div className="text-sm text-muted-foreground">
                                        페이지 {currentPage} / {totalPages}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={currentPage === page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(page)}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        })}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
} 