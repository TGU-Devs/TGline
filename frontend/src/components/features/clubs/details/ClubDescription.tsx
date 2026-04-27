type ClubDescriptionProps = {
    description: string;
};

const ClubDescription = ({ description }: ClubDescriptionProps) => {
    return (
        <section className="bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-4 pl-4 border-l-4 border-blue-500">
                サークルの説明
            </h2>
            <p>{description}</p>
        </section>
    );
};

export default ClubDescription;
