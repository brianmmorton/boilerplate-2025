"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, Search, Brain, Target, Zap, Users, TrendingUp, Globe, MessageSquare, Star, ArrowDown, Lightbulb, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-neutral-900/[0.08]",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
                scale: 0.8,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
                scale: 1,
            }}
            transition={{
                duration: 2.8,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.5 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{
                    y: [0, 20, 0],
                    rotate: [rotate, rotate + 3, rotate],
                }}
                transition={{
                    duration: 15,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r",
                        gradient,
                        "backdrop-blur-[3px] border-2",
                        "shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

export default function Home() {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.95 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 1.2,
                delay: 0.3 + i * 0.15,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    };

    const buttonVariants = {
        hover: {
            scale: 1.05,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            transition: {
                duration: 0.2,
            },
        },
        tap: {
            scale: 0.98,
        },
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.4, 0.25, 1],
            },
        },
    };

    return (
        <div className="relative w-full overflow-hidden">
            {/* Simplified background styling */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 -z-10" />
            
            {/* Reduced decorative elements - only key shapes */}
            <div className="fixed inset-0 overflow-hidden -z-10">
                <ElegantShape
                    delay={0.2}
                    width={600}
                    height={100}
                    rotate={8}
                    gradient="from-blue-500/10 via-indigo-500/8 to-purple-500/6 border-blue-200/20"
                    className="left-[-10%] top-[15%]"
                />
                <ElegantShape
                    delay={0.4}
                    width={400}
                    height={80}
                    rotate={-12}
                    gradient="from-rose-500/10 via-pink-500/8 to-orange-500/6 border-rose-200/20"
                    className="right-[-5%] top-[70%]"
                />
                <ElegantShape
                    delay={0.6}
                    width={300}
                    height={60}
                    rotate={15}
                    gradient="from-emerald-500/10 via-teal-500/8 to-cyan-500/6 border-emerald-200/20"
                    className="right-[15%] top-[10%]"
                />
            </div>

            {/* Subtle grid background */}
            <div 
                className="fixed inset-0 -z-10 opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.04) 1px, transparent 0)`,
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Improved Navigation Header */}
            <motion.nav 
                className="fixed top-0 right-0 left-0 z-50 p-4 md:p-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
            >
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white fill-white" />
                        </div>
                        <span className="ml-2 font-bold text-gray-900 text-lg">Scoutsense</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            if (process.env.NODE_ENV === 'development') {
                                window.location.href = "http://localhost:4000/login";
                            } else {
                                window.location.href = "https://app.scoutsense.work/login";
                            }
                        }}
                        className="px-6 py-2.5 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-800 font-medium hover:bg-white hover:border-gray-300 transition-all duration-300 shadow-sm flex items-center gap-2"
                    >
                        Login <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </div>
            </motion.nav>

            {/* Improved Hero Section */}
            <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20">
                <div className="relative z-10 container mx-auto px-6 md:px-8">
                    <div className="max-w-5xl mx-auto text-center">
                        <motion.div
                            custom={0}
                            variants={fadeUpVariants}
                            initial="hidden"
                            animate="visible"
                            className="mb-8"
                        >
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                    duration: 1.5, 
                                    delay: 0.1,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20 
                                }}
                                className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full shadow-lg"
                            >
                                <Heart className="w-8 h-8 md:w-10 md:h-10 text-white fill-white" />
                            </motion.div>
                        </motion.div>

                        <motion.div
                            custom={1}
                            variants={fadeUpVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-6 md:mb-8 tracking-tight leading-[1.1]">
                                <motion.span 
                                    className="block text-gray-900 mb-2"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                >
                                    Build Products
                                </motion.span>
                                <motion.span 
                                    className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 0.7 }}
                                >
                                    Your Customers
                                </motion.span>
                                <motion.span 
                                    className="block bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent italic"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1, delay: 0.9 }}
                                    style={{ lineHeight: 1.2 }}
                                >
                                    Actually Want
                                </motion.span>
                            </h1>
                        </motion.div>

                        <motion.div
                            custom={2}
                            variants={fadeUpVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <p className="text-lg md:text-xl text-gray-600 mb-10 md:mb-12 leading-relaxed max-w-3xl mx-auto">
                                Stop guessing what to build next. Scoutsense uses AI to automatically discover real customer problems across the internet and suggests 
                                <span className="font-semibold text-gray-800"> winning product solutions</span>.
                            </p>
                        </motion.div>

                        <motion.div
                            custom={3}
                            variants={fadeUpVariants}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => {
                                    if (process.env.NODE_ENV === 'development') {
                                        window.location.href = "http://localhost:4000/signup";
                                    } else {
                                        window.location.href = "https://app.scoutsense.work/signup";
                                    }
                                }}
                                className="group bg-gradient-to-r from-rose-600 to-pink-600 text-white px-8 py-4 md:px-10 md:py-5 rounded-xl flex items-center gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <span>Get Started Free</span>
                                <motion.div
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ 
                                        duration: 2, 
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </motion.div>
                            </motion.button>
                            <p className="text-sm text-gray-500">
                                No credit card required
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Value Proposition Section */}
            <motion.section 
                className="py-16 md:py-24 lg:py-32 relative overflow-hidden bg-gradient-to-br from-slate-50/50 to-blue-50/30"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={containerVariants}
            >
                <div className="container mx-auto px-6 md:px-8 relative z-10">
                    <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                            World class product teams choose 
                            <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                ScoutSense
                            </span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Transform your product development with AI-powered customer intelligence
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <motion.div 
                            variants={itemVariants}
                            className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Research</h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <ChevronRight className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <span>Automatic discovery of customer pain points across 10+ platforms</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <ChevronRight className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <span>Real-time monitoring of social media, forums, and reviews</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <ChevronRight className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <span>Intelligent sentiment analysis and trend detection</span>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div 
                            variants={itemVariants}
                            className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
                                <Lightbulb className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Solutions</h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <ChevronRight className="w-3 h-3 text-rose-600" />
                                    </div>
                                    <span>AI-generated product solutions with feasibility scores</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <ChevronRight className="w-3 h-3 text-rose-600" />
                                    </div>
                                    <span>Prioritized feature recommendations based on impact</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <ChevronRight className="w-3 h-3 text-rose-600" />
                                    </div>
                                    <span>Implementation roadmaps and development guidance</span>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div 
                            variants={itemVariants}
                            className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-6">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Competitive Edge</h3>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                                    </div>
                                    <span>Automated competitor discovery and tracking</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                                    </div>
                                    <span>Feature comparison and gap analysis</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <ChevronRight className="w-3 h-3 text-emerald-600" />
                                    </div>
                                    <span>Early warning system for market changes</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    <motion.div 
                        variants={itemVariants}
                        className="mt-12 md:mt-16 text-center"
                    >
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => {
                                if (process.env.NODE_ENV === 'development') {
                                    window.location.href = "http://localhost:4000/signup";
                                } else {
                                    window.location.href = "https://app.scoutsense.work/signup";
                                }
                            }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl inline-flex items-center gap-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <span>Start Free Trial</span>
                            <ArrowDown className="w-5 h-5 rotate-[-45deg]" />
                        </motion.button>
                        <p className="text-gray-500 mt-4">14-day free trial • No credit card required</p>
                    </motion.div>
                </div>
            </motion.section>

            {/* Improved Features Section */}
            <motion.section 
                className="py-16 md:py-24 lg:py-32 relative overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={containerVariants}
            >
                <div className="container mx-auto px-6 md:px-8 relative z-10">
                    <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">
                                Real Customer Insights, 
                                <span className="block bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Automated Discovery</span>
                            </h3>
                            <div className="space-y-4 md:space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <Users className="w-4 h-4 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Multi-Platform Data Collection</h4>
                                        <p className="text-gray-600">Aggregates customer feedback from 10+ major platforms where your users actually spend time</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <TrendingUp className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Severity & Frequency Analysis</h4>
                                        <p className="text-gray-600">Prioritizes pain points based on impact and prevalence in customer conversations</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                        <Zap className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Actionable Product Ideas</h4>
                                        <p className="text-gray-600">Transforms insights into ranked feature recommendations with feasibility scores</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 md:p-6 rounded-lg shadow-sm mb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                            <span className="text-red-600 font-bold text-sm">!</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-900">High Severity Pain Point</div>
                                            <div className="text-xs text-gray-500">Frequency: 8.5/10</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-3">&ldquo;The checkout process is so complicated, I abandoned my cart three times this week...&rdquo;</p>
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-3 h-3 text-blue-500" />
                                        <span className="text-xs text-blue-600">Source: Reddit, X, Reviews</span>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 md:p-6 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <Star className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-gray-900">Generated Solution</div>
                                            <div className="text-xs text-green-600">Feasibility: High</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700">One-click checkout with guest options and progress indicators</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Improved Data Sources Section */}
            <motion.section 
                className="py-16 md:py-24 lg:py-32 bg-gradient-to-br from-gray-50 to-blue-50/30 relative overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={containerVariants}
            >
                <div className="container mx-auto px-6 md:px-8 relative z-10">
                    <motion.div variants={itemVariants} className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
                            We Monitor <span className="bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">Every Platform</span> Your Customers Use
                        </h2>
                        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Our AI continuously analyzes customer conversations across the internet to find authentic feedback and pain points
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-12 md:mb-16">
                        {[
                            { name: "Reddit", icon: MessageSquare, color: "from-orange-500 to-red-600" },
                            { name: "X (Twitter)", icon: MessageSquare, color: "from-black to-gray-800" },
                            { name: "Google", icon: Search, color: "from-blue-500 to-green-500" },
                            { name: "Amazon", icon: Star, color: "from-yellow-500 to-orange-600" },
                            { name: "Yelp", icon: Star, color: "from-red-500 to-pink-600" },
                            { name: "Facebook", icon: Users, color: "from-blue-600 to-indigo-700" },
                            { name: "Instagram", icon: Users, color: "from-purple-500 to-pink-500" },
                            { name: "TikTok", icon: Users, color: "from-black to-red-500" },
                            { name: "Reviews", icon: Star, color: "from-green-500 to-teal-600" },
                            { name: "Forums", icon: MessageSquare, color: "from-indigo-500 to-purple-600" },
                        ].map((platform) => (
                            <motion.div
                                key={platform.name}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05 }}
                                className="bg-white/90 backdrop-blur-sm p-4 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-center border border-gray-100"
                            >
                                <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3`}>
                                    <platform.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                                </div>
                                <div className="text-sm font-semibold text-gray-800">{platform.name}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-sm border border-gray-100">
                        <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-center">
                            <div>
                                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-2">10+</div>
                                <div className="text-gray-600 font-medium">Data Sources</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-600 mb-2">24/7</div>
                                <div className="text-gray-600 font-medium">Continuous Monitoring</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-purple-600 mb-2">AI</div>
                                <div className="text-gray-600 font-medium">Powered Analysis</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Improved CTA Section */}
            <motion.section 
                className="py-16 md:py-24 lg:py-32 relative overflow-hidden"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={containerVariants}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/95 via-indigo-700/95 to-purple-800/95" />
                <div className="container mx-auto px-6 md:px-8 relative z-10 text-center">
                    <motion.div variants={itemVariants}>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
                            Start Building What Your 
                            <span className="block bg-gradient-to-r from-pink-300 to-yellow-300 bg-clip-text text-transparent">
                                Customers Actually Want
                            </span>
                        </h2>
                        <p className="text-lg md:text-xl text-blue-100 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed">
                            Join innovative product teams using Scoutsense to discover customer pain points and build solutions that matter
                        </p>
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => {
                                if (process.env.NODE_ENV === 'development') {
                                    window.location.href = "http://localhost:4000/signup";
                                } else {
                                    window.location.href = "https://app.scoutsense.work/signup";
                                }
                            }}
                            className="bg-white text-blue-700 px-8 py-4 md:px-12 md:py-6 rounded-xl flex items-center gap-3 text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mx-auto"
                        >
                            <span>Get Started Free</span>
                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ 
                                    duration: 2, 
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut"
                                }}
                            >
                                <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                            </motion.div>
                        </motion.button>
                        <p className="text-blue-200 mt-4 md:mt-6 text-base md:text-lg">
                            No credit card required • Get insights in minutes
                        </p>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}

