// eslint-disable-next-line max-params
(function main() {
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
    return module.exports = parse_files_for_places;

    // -----------

    function parse_files_for_places(files) {
        let places = [];
        for (const file_contents of files) {
            places = places.concat(parse_file_for_places(file_contents));
        }
        console.log(places); // eslint-disable-line no-console
        return places;
    }

    function parse_file_for_places(raw_file_contents) {
        // eslint-disable-next-line max-len
        const file_contents_object = JSON.parse(raw_file_contents.substring(0, raw_file_contents.length - 6));
        let d = file_contents_object.d.substring(5)
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '')
            ; // eslint-disable-line indent
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
}());
