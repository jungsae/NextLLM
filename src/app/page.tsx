// src/app/page.tsx
'use client'; // 클라이언트 컴포넌트임을 명시 (useState, 이벤트 핸들러 사용)

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Settings,
  BarChart3,
  FileText,
  Users,
  Bot,
  Sparkles,
  ArrowRight,
  Clock,
  Activity,
  ShoppingBag
} from "lucide-react";
import { motion } from 'framer-motion';
import { Navbar } from "@/components/navigation/navbar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  totalChats: number;
  totalTokens: number;
  averageResponseTime: number;
  activeUsers: number;
}

export default function DashboardPage() {
  const { isLoggedIn } = useAuth();
  const [stats] = useState<DashboardStats>({
    totalChats: 0,
    totalTokens: 0,
    averageResponseTime: 0,
    activeUsers: 1
  });
  const router = useRouter();

  const dashboardCards = [
    {
      title: "LLM 챗봇",
      description: "LLM 모델과 대화해보세요",
      icon: <Bot className="h-6 w-6" />,
      href: "/chat",
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "상품 보기",
      description: "크롤링된 상품들을 확인하세요",
      icon: <ShoppingBag className="h-6 w-6" />,
      href: "/products",
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "통계 분석",
      description: "사용 통계와 분석 결과를 확인하세요",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/analytics",
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "설정",
      description: "계정 및 시스템 설정을 관리하세요",
      icon: <Settings className="h-6 w-6" />,
      href: "/settings",
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  const statCards = [
    {
      title: "총 대화 수",
      value: stats.totalChats,
      icon: <MessageSquare className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      title: "총 토큰 수",
      value: stats.totalTokens.toLocaleString(),
      icon: <FileText className="h-4 w-4" />,
      color: "text-green-600"
    },
    {
      title: "평균 응답 시간",
      value: `${stats.averageResponseTime}초`,
      icon: <Clock className="h-4 w-4" />,
      color: "text-purple-600"
    },
    {
      title: "활성 사용자",
      value: stats.activeUsers,
      icon: <Users className="h-4 w-4" />,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors closeButton />

      <Navbar />

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pt-[10px] sm:pt-0 pb-4 sm:pb-8">
        {/* 환영 메시지 */}
        {isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-8 mt-0 sm:mt-6"
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold">환영합니다! 🎉</h2>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="mb-4 sm:mb-8 mt-0 sm:mt-6" />
        )}

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-lg sm:text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-1.5 sm:p-2 rounded-lg bg-muted ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 메인 기능 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                onClick={() => {
                  if (isLoggedIn) {
                    router.push(card.href);
                  } else {
                    toast.error('로그인이 필요한 기능입니다. 먼저 로그인해주세요.');
                    router.push('/auth');
                  }
                }}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 sm:p-3 rounded-lg ${card.color} text-white`}>
                      {card.icon}
                    </div>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">{card.title}</CardTitle>
                  <CardDescription className="text-sm">{card.description}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 시스템 상태 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 sm:mt-8"
        >
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                시스템 상태
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs sm:text-sm font-medium">LLM 서버</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">정상</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs sm:text-sm font-medium">데이터베이스</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">연결됨</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs sm:text-sm font-medium">인증 서비스</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">활성</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}