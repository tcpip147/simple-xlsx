import _ from 'lodash';

function appendNode(target, node) {
    _.mergeWith(target, node, function (objValue, srcValue) {
        if (_.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    });
}

function removeNode(target, node) {
    _.remove(target, node);
}

function alphabetToIndex(alphabet) {
    const match = alphabet.match(/([A-Z]+)/);
    let digit = 1;
    let index = 0;
    for (let i = match[1].length - 1; i >= 0; i--) {
        const column = match[1].charCodeAt(i) - 64;
        index += (column * digit);
        digit *= 26;
    }
    return index;
};

function indexToAlphabet(index) {
    let alphabet = "";
    let temp = index - 1;
    while (true) {
        if (temp < 26) {
            alphabet = String.fromCharCode(temp % 26 + 65) + alphabet;
            break;
        }
        alphabet = String.fromCharCode(temp % 26 + 65) + alphabet;
        temp = Math.floor(temp / 26) - 1;
    }
    return alphabet;
};

export {
    appendNode, removeNode, alphabetToIndex, indexToAlphabet
}