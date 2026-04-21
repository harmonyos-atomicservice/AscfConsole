import type { FxNode } from 'forgiving-xml-parser';
import { serialize } from 'forgiving-xml-parser';
import { parseXML } from './parse';

const translatorAttr = (attr: FxNode, node: FxNode) => {
    if (attr.name?.startsWith('wx:')) {
        attr.name = `has:${attr.name.substring(3)}`;
        return;
    }
    if ((node.name === 'include' || node.name === 'import') && attr.name === 'src' && attr.content) {
        attr.content = `${attr.content.substring(0, attr.content.length - 5)}.hxml`;
        return;
    }

    if (node.name === 'wxs' && attr.name === 'src' && attr.content) {
        attr.content = `${attr.content.substring(0, attr.content.length - 4)}.hjs`;
        return;
    }
};

const loopTranslator = (nodes: FxNode[]) => {
    nodes.forEach((node) => {
        let hasSrcAttr = false;
        if (node.attrs) {
            node.attrs.forEach((attr) => {
                hasSrcAttr = hasSrcAttr || attr.name === 'src';
                translatorAttr(attr, node);
            });
        }
        if (node.name === 'wxs') {
            node.name = 'hjs';
        }
        if (node.children) {
            loopTranslator(node.children);
        }
    });
};

export const toAscfXML = (wxml: string): string => {
    const wxmlNodes = parseXML(wxml);
    loopTranslator(wxmlNodes);
    return serialize(wxmlNodes);
};
