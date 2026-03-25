type Props = {
  params: {
    id: string;
  };
};

export default function OrderDetailPage({ params }: Props) {
  return (
    <div>
      <h1>Order Detail</h1>
      <p>ID: {params.id}</p>
    </div>
  );
}