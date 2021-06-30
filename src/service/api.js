export default class Api {

    static async getData(url) {
        return fetch(url).then(res => res.json())
    }
}
