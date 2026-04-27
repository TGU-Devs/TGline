"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ClubHeroCarouselProps = {
    images: string[];
    clubName: string;
};

const ClubHeroCarousel = ({ images, clubName }: ClubHeroCarouselProps) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: "start",
    });
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };

        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi]);

    const scrollPrev = useCallback(() => {
        emblaApi?.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        emblaApi?.scrollNext();
    }, [emblaApi]);

    return (
        <div className="relative w-full h-full touch-pan-y">
            <div ref={emblaRef} className="h-full overflow-hidden">
                <div className="flex h-full">
                    {images.map((img, idx) => (
                        <div
                            key={`${img}-${idx}`}
                            className="relative h-full min-w-0 flex-[0_0_100%]"
                        >
                            <img
                                src={img}
                                alt={`${clubName}の画像 ${idx + 1}`}
                                draggable={false}
                                className="h-full w-full object-cover pointer-events-none select-none"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:hidden absolute bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 backdrop-blur-sm">
                <span className="text-[11px] font-medium text-white/90 tabular-nums">
                    {selectedIndex + 1}/{images.length}
                </span>
                <div className="flex items-center gap-1.5">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => emblaApi?.scrollTo(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                                idx === selectedIndex
                                    ? "w-4 bg-white"
                                    : "w-1.5 bg-white/55"
                            }`}
                            aria-label={`${idx + 1}枚目へ移動`}
                        />
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={scrollPrev}
                className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-white"
                aria-label="前の画像へ"
            >
                <ChevronLeft size={18} />
            </button>
            <button
                type="button"
                onClick={scrollNext}
                className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto hover:bg-white"
                aria-label="次の画像へ"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default ClubHeroCarousel;
