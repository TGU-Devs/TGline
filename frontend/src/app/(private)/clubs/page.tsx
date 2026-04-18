"use client";

import { useState } from "react";

import Main from "@/components/ui/PageMain";
import ClubHeader from "@/components/features/clubs/ClubsHeader";
import CategoriesButton from "@/components/features/clubs/CategoriesButton";
import ClubsList from "@/components/features/clubs/ClubsList";

import { clubs } from "@/constants/clubs";

const ClubPage = () => {
    const [activeStatus, setActiveStatus] = useState<string>("すべて");
    const [activeCategory, setActiveCategory] = useState<string>("すべて");

    const filteredClubs = clubs
        .filter((club) =>
            activeCategory === "すべて"
                ? true
                : club.category === activeCategory,
        )
        .filter((club) =>
            activeStatus === "すべて" ? true : club.status === activeStatus,
        );

    return (
        <Main>
            <ClubHeader
                activeStatus={activeStatus}
                setActiveStatus={setActiveStatus}
            />

            <CategoriesButton
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />

            <ClubsList clubs={filteredClubs} />
        </Main>
    );
};

export default ClubPage;
