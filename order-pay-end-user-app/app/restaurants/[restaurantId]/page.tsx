import { MenuModule } from "@/components/menu_module";

export default async function RestaurantMenuPage({ params }: any) {
  const awaitedParams = await params;
  return (
    <main className="min-h-screen flex items-center justify-center">
      <MenuModule restaurantId={Number(awaitedParams.restaurantId)} />
    </main>
  );
}
