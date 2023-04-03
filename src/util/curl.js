import {toJsonString} from "curlconverter";

function curl2json(val) {
    console.log(toJsonString(val))
    return toJsonString(val)
}

const curl = {
    curl2json
}
export default curl