import { Github } from "@medusajs/icons";
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Heading } from "@modules/common/components/ui";
const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-3xl leading-10 text-ui-fg-base font-normal"
          >
            LegnoNest Online Satış Merkezi
          </Heading>
          <Heading
            level="h2"
            className="text-3xl leading-10 text-ui-fg-subtle font-normal"
          >
            "Kaliteli ve güvenilir ürünler ile sizlere hizmet ediyoruz"
          </Heading>
        </span>
        <LocalizedClientLink href="/store">
          <Button variant="secondary">
            Ürünleri İncele
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  );
};

export default Hero;
