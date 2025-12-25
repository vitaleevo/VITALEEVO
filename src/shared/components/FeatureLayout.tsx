"use client";

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface FeatureLayoutProps {
    children: React.ReactNode;
}

const FeatureLayout: React.FC<FeatureLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default FeatureLayout;
