'use client';

import { Navbar } from '@/components/navigation/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    ShoppingBag,
    Tag,
    ExternalLink,
    Clock,
    CheckCircle,
    XCircle,
    Eye
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
    const [userId, setUserId] = useState<string | null>(null);

    // 사용자 ID 가져오기
    useEffect(() => {
        const checkUser = async () => {
            try {
                const res = await fetch('/api/auth/check');
                const data = await res.json();
                if (data.isLoggedIn && data.user) {
                    setUserId(data.user.id);
                }
            } catch (error) {
                console.error('사용자 확인 실패:', error);
            }
        };
        checkUser();
    }, []);

    // 크롤링 세션 목록 가져오기
    const fetchSessions = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/products?userId=${userId}`);
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
        if (userId) {
            fetchSessions();
        }
    }, [userId]);

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
        await fetchSessionProducts(session.id);
    };

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
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                {selectedSession?.name} - 상품 목록
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            {selectedSessionProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">이 세션에 수집된 상품이 없습니다.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedSessionProducts.map((product) => (
                                        <Card key={product.id} className="overflow-hidden">
                                            <div className="relative">
                                                <img
                                                    src={product.image || ''}
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
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
} 