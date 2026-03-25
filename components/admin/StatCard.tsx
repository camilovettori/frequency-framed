type StatCardProps = {
  label: string;
  value: string | number;
};

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="border border-[#e7d9ca] bg-white p-6">
      <p className="text-xs uppercase tracking-[0.22em] text-[#8b6f5d]">
        {label}
      </p>
      <p className="mt-4 text-4xl leading-none tracking-[-0.03em] text-[#4b3226]">
        {value}
      </p>
    </div>
  );
}