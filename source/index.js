/* eslint-disable no-sync */
// eslint-disable-next-line max-params
(function main(FS) {
    const GOOGLE_MAPS_WEB_URL_PREFIX = 'https://www.google.com/maps?q=';
    const PLACE_ID = 78;
    const PLACE_TITLE = 11;
    const PLACE_ADDRESS_ARRAY = 2;
    const PLACE_PHONE = 3;
    const PLACE_WEBSITE = 7;
    const PLACE_WEBSITE_URL = 0;
    const PLACE_WEBSITE_TITLE = 1;
    const PLACE_COORDS = 9;
    const PLACE_COORDS_LAT = 2;
    const PLACE_COORDS_LONG = 3;
    const PLACE_BLURB_0 = 25;
    const PLACE_BLURB_1 = 15;
    const PLACE_BLURB_2 = 0;
    const PLACE_BLURB_3 = 2;
    return module.exports = parse_files_for_places;

    // -----------

    function parse_files_for_places(file_list) {
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
            const raw_meta = raw_place[14];
            const lat = raw_meta[PLACE_COORDS][PLACE_COORDS_LAT];
            const long = raw_meta[PLACE_COORDS][PLACE_COORDS_LONG];
            const place = {
                google_places_id: raw_meta[PLACE_ID],
                title: raw_meta[PLACE_TITLE],
                address: raw_meta[PLACE_ADDRESS_ARRAY],
                phone: raw_meta[PLACE_PHONE] && raw_meta[PLACE_PHONE][0],
                website: raw_meta[PLACE_WEBSITE] && {
                    title: raw_meta[PLACE_WEBSITE][PLACE_WEBSITE_TITLE],
                    url: raw_meta[PLACE_WEBSITE][PLACE_WEBSITE_URL],
                    }, // eslint-disable-line indent
                coords: [ lat, long ],
                blurb: raw_meta[PLACE_BLURB_0]
                    && raw_meta[PLACE_BLURB_0][PLACE_BLURB_1]
                    && raw_meta[PLACE_BLURB_0][PLACE_BLURB_1][PLACE_BLURB_2]
                    && raw_meta[PLACE_BLURB_0][PLACE_BLURB_1][PLACE_BLURB_2][PLACE_BLURB_3] // eslint-disable-line max-len
                    || null
                    , // eslint-disable-line
                }; // eslint-disable-line indent
            const google_maps_q = encodeURIComponent(
                `${ place.title }, ${ place.address.join(', ') }`,
                ); // eslint-disable-line indent
            place.google_maps_web_url
                = `${ GOOGLE_MAPS_WEB_URL_PREFIX }${ google_maps_q }`
                ; // eslint-disable-line indent
            return place;
        }
    }
}(
    require('fs'),
));
