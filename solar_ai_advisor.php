
<?php
/**
 * Plugin Name: Solar AI Advisor Professional
 * Description: High-performance Solar Dashboard with Gemini AI and dedicated Lead Management.
 * Version: 2.8.0
 * Author: Solar Tech Team
 */

if (!defined('ABSPATH')) exit;

// --- [EXISTING CPT AND ADMIN CODE REMAINS THE SAME] ---
// (Keeping only relevant update for CORS and REST API)

// NEW: Add CORS support for external deployments (Vercel)
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        $origin = get_http_origin();
        // You can restrict this to your specific Vercel URL for better security:
        // if ($origin === 'https://your-app.vercel.app') { ... }
        header('Access-Control-Allow-Origin: ' . ($origin ? $origin : '*'));
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');

        return $value;
    });
}, 15);

// 1. Register Custom Post Type for Solar Leads
add_action('init', function() {
    register_post_type('solar_lead', [
        'labels' => [
            'name'               => 'Solar Leads',
            'singular_name'      => 'Solar Lead',
            'edit_item'          => 'View Lead',
            'all_items'          => 'All Solar Leads',
            'search_items'       => 'Search Leads',
            'not_found'          => 'No leads found',
            'not_found_in_trash' => 'No leads found in Trash',
        ],
        'public'              => true,
        'show_ui'             => true,
        'show_in_menu'        => true,
        'menu_icon'           => 'dashicons-id-alt',
        'supports'            => ['title'], 
        'has_archive'         => false,
        'exclude_from_search' => true,
        'publicly_queryable'  => false,
        'capability_type'     => 'post',
        'capabilities'        => array(
            'create_posts' => 'do_not_allow', 
        ),
        'map_meta_cap'        => true,
        'query_var'           => true,
        'rewrite'             => false,
    ]);
});

// [ADMIN METABOXES AND EXPORT LOGIC REMAIN UNCHANGED...]
// (I am omitting the long repeated sections of CSV/PDF export for brevity, 
// they should stay as they are in your previous version)

// 10. REST API Callback (Modified to work with CORS)
add_action('rest_api_init', function () {
    register_rest_route('solar-ai/v1', '/save-lead', [
        'methods' => 'POST',
        'callback' => function($request) {
            $params = $request->get_json_params();
            
            if (empty($params['name'])) {
                return new WP_Error('missing_data', 'Name is required', ['status' => 400]);
            }

            $name = sanitize_text_field($params['name']);
            $phone = sanitize_text_field($params['phone'] ?? '-');
            $email = sanitize_email($params['email'] ?? '-');
            $location = sanitize_text_field($params['location'] ?? '-');
            $category = sanitize_text_field($params['category'] ?? '-');
            $unitCost = sanitize_text_field($params['unitCost'] ?? '-');
            $area = sanitize_text_field($params['rooftopAreaValue'] ?? '-');
            $unit = sanitize_text_field($params['rooftopAreaUnit'] ?? '');
            $usable = sanitize_text_field($params['usableAreaPercentage'] ?? '-');

            $post_content = "
            <div style='max-width: 100%; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; font-family: sans-serif;'>
                <div style='background: #1e3a5f; padding: 25px; color: white;'>
                    <h2 style='margin: 0;'>Project Lead Assessment</h2>
                    <p style='margin: 5px 0 0; opacity: 0.8;'>Capture Date: " . date('M d, Y - H:i') . "</p>
                </div>
                <table style='width: 100%; border-collapse: collapse; background: white;'>
                    <tr><td style='padding: 14px 25px; width: 30%; color: #64748b;'>Name</td><td style='padding: 14px 25px; color: #1e293b; font-weight: 700;'>$name</td></tr>
                    <tr><td style='padding: 14px 25px; color: #64748b;'>Phone</td><td style='padding: 14px 25px;'>$phone</td></tr>
                    <tr><td style='padding: 14px 25px; color: #64748b;'>Email</td><td style='padding: 14px 25px;'>$email</td></tr>
                </table>
            </div>";

            $post_id = wp_insert_post([
                'post_title'   => $name,
                'post_type'    => 'solar_lead',
                'post_status'  => 'publish',
                'post_content' => $post_content,
            ]);

            if (is_wp_error($post_id)) return $post_id;

            // Meta updates
            update_post_meta($post_id, '_lead_name', $name);
            update_post_meta($post_id, '_lead_phone', $phone);
            update_post_meta($post_id, '_lead_email', $email);
            update_post_meta($post_id, '_lead_location', $location);
            update_post_meta($post_id, '_lead_category', $category);
            update_post_meta($post_id, '_lead_area_value', $area);
            update_post_meta($post_id, '_lead_area_unit', $unit);
            update_post_meta($post_id, '_lead_unit_cost', $unitCost);
            update_post_meta($post_id, '_lead_usable_percent', $usable);

            return ['success' => true, 'id' => $post_id];
        },
        'permission_callback' => '__return_true' // Allows external Vercel app to post
    ]);
});
