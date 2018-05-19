/* eslint-disable no-sync */
// eslint-disable-next-line max-params
(function main(FS) {
    const GOOGLE_MAPS_WEB_URL_PREFIX = 'https://www.google.com/maps?q=';
    const PLACE_INFO_ROOT = 14;
    const PLACE_ID = 78;
    const PLACE_TITLE = 11;
    const PLACE_ADDRESS_ARRAY = 2;
    const PLACE_PHONE = [ 3, 0 ];
    const PLACE_WEBSITE_URL = [ 7, 0 ];
    const PLACE_WEBSITE_TITLE = [ 7, 1 ];
    const PLACE_COORDS_LAT = [ 9, 2 ];
    const PLACE_COORDS_LONG = [ 9, 3 ];
    const PLACE_USER_BLURB_A = [ 25, 15, 0, 2 ];
    const PLACE_USER_BLURB_B = [ 25, 15, 1, 2 ];
    const PLACE_GOOGLE_BLURB = [ 32, 0, 1 ];
    const PLACE_GOOGLE_DESC = [ 32, 1, 1 ];

    return module.exports = parse_files_for_places;

    // -----------

    function parse_files_for_places(raw_file_list) {
        const file_list = build_file_list(raw_file_list);
        let places = [];
        for (const file_name of file_list) {
            const file_contents = FS.readFileSync(file_name, 'utf8');
            places = places.concat(
                parse_file_for_places(file_name, file_contents),
                ); // eslint-disable-line
        }
        return places;
    }

    function parse_file_for_places(file_name, raw_file_contents) {
        // eslint-disable-next-line max-len
        const file_contents_object = JSON.parse(raw_file_contents.substring(0, raw_file_contents.length - 6));
        let d = file_contents_object.d.substring(5)
            .replace(/(?!\\)\\"/g, '"')
            .replace(/\\n/g, '')
            ; // eslint-disable-line indent
        // FS.writeFileSync(`${ file_name }: d.txt`, d);
        d = JSON.parse(d);
        const raw_places = d[0][1];
        const places = [];
        for (const raw_place of raw_places) {
            places.push(compose_place(raw_place));
        }
        return places;

        // -----------

        function compose_place(raw_place) {
            const place = {
                google_place_id: get_value(raw_place, PLACE_ID),
                title: get_value(raw_place, PLACE_TITLE),
                address: get_value(raw_place, PLACE_ADDRESS_ARRAY),
                phone: get_value(raw_place, PLACE_PHONE),
                website: {
                    title: get_value(raw_place, PLACE_WEBSITE_TITLE),
                    url: get_value(raw_place, PLACE_WEBSITE_URL),
                    }, // eslint-disable-line indent
                coords: [
                    get_value(raw_place, PLACE_COORDS_LAT),
                    get_value(raw_place, PLACE_COORDS_LONG),
                    ], // eslint-disable-line indent
                user_blurb: get_value(raw_place, PLACE_USER_BLURB_A)
                    || get_value(raw_place, PLACE_USER_BLURB_B)
                    , // eslint-disable-line
                google_blurb: get_value(raw_place, PLACE_GOOGLE_BLURB),
                google_description: get_value(raw_place, PLACE_GOOGLE_DESC),
                }; // eslint-disable-line indent
            const google_maps_q = encodeURIComponent(
                `${ place.title }, ${ place.address.join(', ') }`,
                ); // eslint-disable-line indent
            place.google_maps_web_url
                = `${ GOOGLE_MAPS_WEB_URL_PREFIX }${ google_maps_q }`
                ; // eslint-disable-line indent
            return place;
        }

        function get_value(raw_place, raw_location) {
            let value = raw_place[PLACE_INFO_ROOT];
            const location = Array.isArray(raw_location)
                ? raw_location.slice()
                : [ raw_location ]
                ; // eslint-disable-line indent
            while (location.length > 0) {
                const key = location.shift();
                if (null === value || undefined === value[key]) {
                    return null;
                }
                value = value[key];
            }
            return '' === value ? null : value;
        }
    }

    // -----------

    function build_file_list(raw_file_list) {
        if (raw_file_list) {
            return build_safe_file_list(raw_file_list);
        }
        const HOME_DIR = require('os').homedir();
        let file_i = 0;
        let file_name = 'f';
        let full_file_path;
        const default_file_list = [];
        // eslint-disable-next-line max-len
        while (FS.existsSync(
            full_file_path = `${ HOME_DIR }/Downloads/${ file_name }.txt`,
            )) { // eslint-disable-line indent
            default_file_list.push(full_file_path);
            file_name = `f (${ ++file_i })`;
        }
        return default_file_list;
    }

    function build_safe_file_list(raw_file_list) {
        const safe_file_list = [];
        for (let i = 0, n = raw_file_list.length - 1; i <= n; i++) {
            const raw_file = raw_file_list[i];
            FS.existsSync(raw_file) && safe_file_list.push(raw_file);
        }
        return safe_file_list;
    }
}(
    require('fs'),
));
