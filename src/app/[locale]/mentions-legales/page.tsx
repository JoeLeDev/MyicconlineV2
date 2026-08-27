import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { Link } from "@/i18n/navigation";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("mentionsTitle"),
    description: t("mentionsTitle"),
  };
}

export default async function MentionsLegalesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <LegalDocument
      eyebrow={t("mentionsEyebrow")}
      title={t("mentionsTitle")}
      updated={t("updated")}
      note={locale === "fr" ? undefined : t("officialNote")}
    >
      <h2>1. Éditeur du site</h2>
      <p>
        Le site{" "}
        <a href="https://myicconline.com/">https://myicconline.com/</a> est
        édité par :
      </p>
      <p>
        ICC Online – Impact Centre Chrétien
        <br />
        21 rue des Veilles Vignes, 77183 Croissy-Beaubourg, France
        <br />
        E-mail :{" "}
        <a href="mailto:netezoua@yahoo.fr">netezoua@yahoo.fr</a>
      </p>

      <h2>2. Directeur de la publication</h2>
      <p>
        Le directeur de la publication est le responsable légal d’Impact Centre
        Chrétien.
        <br />
        Contact :{" "}
        <a href="mailto:netezoua@yahoo.fr">netezoua@yahoo.fr</a>
      </p>

      <h2>3. Hébergement</h2>
      <p>Le site est hébergé par :</p>
      <p>
        Impact Centre Chrétien
        <br />
        21 rue des Veilles Vignes, 77183 Croissy-Beaubourg, France
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L’ensemble des contenus présents sur ICC Online Community (textes,
        images, vidéos, logos, graphismes, structure du site) est protégé par le
        droit d’auteur et les lois relatives à la propriété intellectuelle.
      </p>
      <p>
        Toute reproduction, représentation, modification ou exploitation,
        totale ou partielle, sans autorisation préalable écrite d’Impact Centre
        Chrétien est interdite.
      </p>

      <h2>5. Données personnelles</h2>
      <p>
        Les données personnelles collectées sur le site font l’objet d’un
        traitement conforme au RGPD. Pour en savoir plus sur vos droits et la
        gestion de vos données, consultez notre{" "}
        <Link href="/politique-de-confidentialite">
          politique de confidentialité
        </Link>
        .
      </p>

      <h2>6. Responsabilité</h2>
      <p>
        ICC Online s’efforce d’assurer l’exactitude des informations diffusées
        sur le site. Toutefois, nous ne pouvons garantir l’absence d’erreurs ou
        d’omissions.
      </p>
      <p>
        L’utilisateur est seul responsable de l’usage qu’il fait du site et des
        informations qui y sont publiées dans le cadre des fonctionnalités
        communautaires (profil, groupes, messages, publications).
      </p>

      <h2>7. Liens hypertextes</h2>
      <p>
        Le site peut contenir des liens vers des sites tiers. ICC Online
        n’exerce aucun contrôle sur ces sites et décline toute responsabilité
        quant à leur contenu.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question relative au site ou aux présentes mentions légales :{" "}
        <a href="mailto:netezoua@yahoo.fr">netezoua@yahoo.fr</a>
      </p>
    </LegalDocument>
  );
}
