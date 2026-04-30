import Main from "@/components/ui/PageMain";
import BackButton from "@/components/features/clubs/details/BackButton";
import HeroSection from "@/components/features/clubs/details/HeroSection";
import ClubDescription from "@/components/features/clubs/details/ClubDescription";
import ClubActivityInfo from "@/components/features/clubs/details/ClubActivityInfo";
import ClubContact from "@/components/features/clubs/details/ClubContact";
import { clubs } from "@/constants/clubs";

import type { Club } from "@/components/features/clubs/types";

type ClubDetailPageProps = {
    params: {
        slug: string;
    };
};

const ClubDetailPage = async ({ params }: ClubDetailPageProps) => {
    const resolveParams = await params;
    const clubSlug = resolveParams.slug;

    const club: Club | undefined = clubs.find((c) => c.slug === clubSlug);

    if (!club) {
        return (
            <Main>
                <div className="flex flex-col items-center justify-center h-96">
                    <h2 className="text-2xl font-bold mb-4">
                        サークルが見つかりません
                    </h2>
                    <p className="text-muted-foreground">
                        お探しのサークルは見つかりませんでした。
                    </p>
                </div>
            </Main>
        );
    }

    return (
        <Main padding="px-0 lg:p-12">
            <BackButton />

            <HeroSection club={club} />

            <div className="mb-12 px-6 md:mt-4 lg:mt-12 lg:p-0 grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="col-span1 lg:col-span-2 space-y-10">
                    <ClubDescription description={club.longDescription} />

                    <ClubActivityInfo
                        location={club.location}
                        schedule={club.schedule}
                        costs={club.costs}
                        GenderRatio={club.GenderRatio}
                    />
                </div>
                <div className="col-span1 lg:col-span-1 ">
                    <ClubContact clubName={club.name} clubContact={club.contact} />
                </div>
            </div>
        </Main>
    );
};

export default ClubDetailPage;
