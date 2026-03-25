type Props = {
  params: {
    id: string;
  };
};

export default function BlogDetailPage({ params }: Props) {
  const { id } = params;

  return (
    <div>
      <h1>Blog Detail</h1>
      <p>ID: {id}</p>
    </div>
  );
}