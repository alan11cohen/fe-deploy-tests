import { MenuModule } from "@/components/menu_module";

export default function RestaurantMenuPage({ params }: any) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <MenuModule restaurantId={Number(params.restaurantId)} />
    </main>
  );
}
