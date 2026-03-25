type Props = {
  params: {
    id: string;
  };
};

export default function GalleryDetailPage({ params }: Props) {
  return (
    <div>
      <h1>Gallery Detail</h1>
      <p>ID: {params.id}</p>
    </div>
  );
}