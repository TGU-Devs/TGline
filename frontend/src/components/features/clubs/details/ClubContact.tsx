'use client';

import { useState } from "react";
import ClubContactModal from "./ContactModal";
import type { Club } from "@/components/features/clubs/types";

type ClubContactProps = {
    clubContact: Club["contact"];
};

const ClubContact = ({ clubContact }: ClubContactProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <section className="lg:bg-card lg:p-4 lg:rounded-lg lg:shadow-sm">
            <h2 className="hidden lg:block text-2xl font-bold mb-4 pl-4 border-l-4 border-blue-500">
                お問い合わせ
            </h2>
            <div className="fixed bottom-0 left-0 right-0 z-40 p-4 lg:static lg:z-auto lg:p-0 lg:bg-transparent lg:backdrop-blur-none lg:border-none lg:shadow-none lg:mt-2 lg:px-6">
                <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-4xl w-full max-w-lg mx-auto block shadow-lg transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                    onClick={() => setIsModalOpen(true)}
                >
                    興味がある
                </button>
            </div>

            <ClubContactModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                clubContact={clubContact} 
            />
        </section>
    );
};

export default ClubContact;
