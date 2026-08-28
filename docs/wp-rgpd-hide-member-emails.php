<?php
/**
 * RGPD — Masquer les e-mails dans l’API myicconline/v1 (membres)
 *
 * À intégrer dans le plugin/thème WordPress « myicconline » sur cPanel
 * (wp-content/plugins/… ou mu-plugin), puis vider le cache objet si actif.
 *
 * Effet :
 * - Retire le champ `email` des réponses publiques /members et /member/{slug}
 * - Conserve l’e-mail pour l’utilisateur connecté sur /profile (JWT)
 *
 * IMPORTANT : adapter les noms de callbacks si votre plugin diffère.
 */

add_filter('rest_prepare_user', 'icc_hide_member_email_in_rest', 10, 3);

function icc_hide_member_email_in_rest($response, $user, $request) {
    if (!$response instanceof WP_REST_Response) {
        return $response;
    }

    $route = $request->get_route();

    // Routes publiques annuaire — ne jamais exposer l’e-mail
    if (
        str_starts_with($route, '/myicconline/v1/members') ||
        preg_match('#^/myicconline/v1/member/[^/]+/?$#', $route)
    ) {
        $data = $response->get_data();
        unset($data['email']);
        $response->set_data($data);
    }

    return $response;
}

/**
 * Si votre plugin construit manuellement les tableaux membres (sans WP_User),
 * filtrer directement dans les callbacks register_rest_route :
 */
function icc_strip_email_from_member_payload(array $member): array {
    unset($member['email']);
    return $member;
}

// Exemple dans le callback /members :
// $members = array_map('icc_strip_email_from_member_payload', $members);
// return rest_ensure_response($members);
