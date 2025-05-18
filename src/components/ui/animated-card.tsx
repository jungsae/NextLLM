import { motion } from 'framer-motion';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { scaleIn } from '@/lib/animations';
import { ReactNode } from 'react';

interface AnimatedCardProps extends CardProps {
    delay?: number;
    className?: string;
    children: ReactNode;
}

export function AnimatedCard({ className, children, delay = 0, ...props }: AnimatedCardProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={scaleIn}
            transition={{ delay }}
        >
            <Card className={cn('', className)} {...props}>
                {children}
            </Card>
        </motion.div>
    );
} 