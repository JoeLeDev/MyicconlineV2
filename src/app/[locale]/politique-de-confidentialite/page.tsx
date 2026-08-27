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
    title: t("privacyTitle"),
    description: t("privacyTitle"),
  };
}

export default async function PolitiqueConfidentialitePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <LegalDocument
      eyebrow={t("privacyEyebrow")}
      title={t("privacyTitle")}
      updated={t("updated")}
      note={locale === "fr" ? undefined : t("officialNote")}
    >
      <h2>1. Introduction</h2>
      <p>
        La présente politique de confidentialité explique comment ICC Online
        Community (ci-après « nous », « ICC Online ») collecte et traite vos
        données personnelles lorsque vous utilisez le site{" "}
        <a href="https://myicconline.com/">https://myicconline.com/</a>, créez
        un compte membre, rejoignez une Famille d’Impact Online (FIO), vous
        inscrivez à une formation ou échangez via les outils communautaires.
      </p>
      <p>
        Nous nous engageons à respecter le Règlement général sur la protection
        des données (RGPD) et la loi Informatique et Libertés.
      </p>

      <h2>2. Responsable du traitement</h2>
      <p>
        Responsable : ICC Online
        <br />
        Contact données personnelles :{" "}
        <a href="mailto:netezoua@yahoo.fr">netezoua@yahoo.fr</a>
      </p>

      <h2>3. Données collectées</h2>
      <p>Selon votre utilisation du site, nous pouvons collecter :</p>
      <ul>
        <li>
          <strong>Compte membre :</strong> identifiant, adresse e-mail, mot de
          passe (stocké de manière chiffrée), prénom, nom.
        </li>
        <li>
          <strong>Profil communautaire :</strong> informations de profil
          BuddyPress (photo, description, téléphone le cas échéant),
          appartenance aux groupes et FIO.
        </li>
        <li>
          <strong>Inscription aux formations :</strong> prénom, nom, e-mail,
          téléphone, ancienneté sur ICC Online, FIO, statut (membre, pilote,
          copilote), formations PCNC validées, commentaires éventuels.
        </li>
        <li>
          <strong>Activité :</strong> publications, messages, participations aux
          groupes, inscriptions aux événements ou missions.
        </li>
        <li>
          <strong>Données techniques :</strong> adresse IP, logs de connexion,
          cookies de session, mesures anti-spam (ex. Cloudflare Turnstile le cas
          échéant).
        </li>
      </ul>

      <h2>4. Finalités et bases légales</h2>
      <table>
        <thead>
          <tr>
            <th>Finalité</th>
            <th>Base légale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Création et gestion de votre compte</td>
            <td>Exécution du contrat / mesures précontractuelles</td>
          </tr>
          <tr>
            <td>Accès aux formations et suivi pédagogique (LearnPress)</td>
            <td>Exécution du contrat</td>
          </tr>
          <tr>
            <td>Animation des FIO et de la communauté</td>
            <td>Intérêt légitime / exécution du contrat</td>
          </tr>
          <tr>
            <td>Sécurité du site et lutte contre la fraude</td>
            <td>Intérêt légitime</td>
          </tr>
          <tr>
            <td>
              Communication relative au service (notifications, messages)
            </td>
            <td>Exécution du contrat / intérêt légitime</td>
          </tr>
          <tr>
            <td>Newsletter ou prospection (si activée)</td>
            <td>Consentement</td>
          </tr>
        </tbody>
      </table>

      <h2>5. Durée de conservation</h2>
      <ul>
        <li>
          <strong>Compte actif :</strong> pendant toute la durée de votre
          adhésion au site.
        </li>
        <li>
          <strong>Données d’inscription formation :</strong> conservées le temps
          nécessaire à la gestion pédagogique et administrative des formations,
          puis archivées ou supprimées selon les obligations légales.
        </li>
        <li>
          <strong>Logs techniques :</strong> durée limitée (généralement 12 mois
          maximum), sauf obligation légale contraire.
        </li>
        <li>
          <strong>Compte inactif :</strong> suppression ou anonymisation après
          une période d’inactivité prolongée, sous réserve des obligations
          légales.
        </li>
      </ul>

      <h2>6. Destinataires et sous-traitants</h2>
      <p>
        Vos données sont accessibles uniquement aux personnes habilitées au sein
        d’ICC Online (équipe, responsables de formation, pilotes le cas
        échéant).
      </p>
      <p>
        Nous pouvons faire appel à des prestataires techniques agissant pour
        notre compte :
      </p>
      <ul>
        <li>Hébergeur du site web</li>
        <li>
          WordPress et extensions associées (BuddyPress / BuddyBoss, LearnPress,
          messagerie, etc.)
        </li>
        <li>Outils de sécurité et anti-spam (ex. Cloudflare)</li>
        <li>Prestataires d’e-mail transactionnel le cas échéant</li>
      </ul>
      <p>
        Ces prestataires ne traitent vos données que sur nos instructions et
        dans le cadre de garanties appropriées.
      </p>

      <h2>7. Transferts hors Union européenne</h2>
      <p>
        Certains prestataires peuvent être situés en dehors de l’Union
        européenne. Lorsque c’est le cas, nous veillons à ce que des garanties
        appropriées soient mises en place (clauses contractuelles types,
        décisions d’adéquation, ou mesures équivalentes).
      </p>

      <h2>8. Cookies et traceurs</h2>
      <p>
        Le site utilise des cookies strictement nécessaires au fonctionnement
        (session, sécurité, préférences de connexion). D’autres cookies peuvent
        être déposés par des services tiers (statistiques, anti-spam). Vous
        pouvez configurer votre navigateur pour refuser les cookies non
        essentiels.
      </p>

      <h2>9. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>Droit d’accès et de rectification</li>
        <li>Droit à l’effacement (« droit à l’oubli »)</li>
        <li>Droit à la limitation du traitement</li>
        <li>Droit d’opposition</li>
        <li>Droit à la portabilité (le cas échéant)</li>
        <li>
          Droit de retirer votre consentement à tout moment (pour les traitements
          fondés sur le consentement)
        </li>
      </ul>
      <p>
        Pour exercer vos droits, écrivez à{" "}
        <a href="mailto:netezoua@yahoo.fr">netezoua@yahoo.fr</a> en précisant
        votre identité et votre demande. Une réponse vous sera apportée dans un
        délai d’un mois.
      </p>
      <p>
        Vous pouvez également introduire une réclamation auprès de la CNIL :{" "}
        <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
          www.cnil.fr
        </a>
        .
      </p>

      <h2>10. Sécurité</h2>
      <p>
        Nous mettons en œuvre des mesures techniques et organisationnelles
        adaptées (authentification, contrôle d’accès, sauvegardes, protection
        anti-spam) pour protéger vos données contre la perte, l’accès non
        autorisé ou la divulgation.
      </p>

      <h2>11. Mineurs</h2>
      <p>
        Le site s’adresse principalement à un public adulte. Si vous pensez
        qu’un mineur nous a transmis des données sans autorisation parentale,
        contactez-nous afin que nous puissions les supprimer.
      </p>

      <h2>12. Mise à jour</h2>
      <p>
        Cette politique peut être modifiée pour refléter l’évolution du site ou
        de la réglementation. La date de dernière mise à jour est indiquée
        ci-dessous. Nous vous invitons à la consulter régulièrement.
      </p>
      <p>
        Voir aussi nos{" "}
        <Link href="/mentions-legales">mentions légales</Link>.
      </p>
    </LegalDocument>
  );
}
