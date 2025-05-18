import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { scaleIn } from '@/lib/animations';
import { ReactNode } from 'react';

interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
}

export function AnimatedCard({ children, className }: AnimatedCardProps) {
    return (
        <motion.div
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn("w-full", className)}
        >
            <Card className="w-full">
                {children}
            </Card>
        </motion.div>
    );
} 