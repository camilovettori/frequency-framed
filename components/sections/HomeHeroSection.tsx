import Container from "@/components/ui/container";
import { getHomeHeroItems } from "@/lib/home-hero";
import HomeHeroClient from "./HomeHeroClient";

export default async function HomeHeroSection() {
  const items = await getHomeHeroItems();

  return (
    <section className="pt-16 pb-24 md:pt-20 md:pb-28">
      <Container>
        <HomeHeroClient items={items} />
      </Container>
    </section>
  );
}