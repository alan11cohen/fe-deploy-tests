interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm text-center">
    <div className="inline-flex justify-center items-center mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2 text-black">{title}</h3>
    <p className="text-black">{description}</p>
  </div>
);
