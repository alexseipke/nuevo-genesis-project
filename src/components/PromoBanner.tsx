interface PromoBannerProps {}

export function PromoBanner({}: PromoBannerProps) {
  return (
    <div className="bg-gradient-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-6 py-2">
        <p className="text-sm text-foreground text-center">
          <span className="font-semibold">¡Aprovecha al máximo Planner-Viizor!</span> Descarga{" "}
          <a 
            href="https://forum.flylitchi.com/t/open-beta-litchi-pilot/10621" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 font-semibold underline"
          >
            Litchi Pilot
          </a>{" "}
          ya que es compatible con Mini 4 Pro, Mini 3 & Mini 3 Pro, Matrice 4 (4E, 4T, 4D, 4TD), Mavic 3 Enterprise (3E, 3T, 3M), Matrice 30, Matrice 300 & 350 RTK
        </p>
      </div>
    </div>
  );
}