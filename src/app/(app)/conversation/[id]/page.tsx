export default function MessagePage({ params }: { params: { id: string } }) {
    return (
        <div>
            hello this is message page {params.id}
        </div>
    )
}