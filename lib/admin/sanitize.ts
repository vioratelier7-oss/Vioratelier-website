import "server-only";
import sanitizeHtml from "sanitize-html";

/** Allow-list for article HTML produced by the CMS editor. Anything else is stripped. */
export function sanitizeArticle(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "blockquote", "a", "img", "hr", "code", "pre", "figure", "figcaption"],
    allowedAttributes: { a: ["href", "title", "target", "rel"], img: ["src", "alt", "title", "width", "height"] },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      h1: "h2",
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? "") && !/^https?:\/\/(www\.)?vioratelier\.com/i.test(attribs.href ?? "");
        return { tagName, attribs: { ...attribs, ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}) } };
      },
    },
    exclusiveFilter: (frame) =>
      (frame.tag === "img" && !/^(https?:\/\/|\/[^/])/i.test(frame.attribs.src ?? "")) ||
      (frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren?.length),
  }).trim();
}
