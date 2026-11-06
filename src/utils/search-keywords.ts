// search-keywords -- build-time Chinese word segmentation for pagefind.
//
// Why: pagefind 1.5.2's index segmenter glues CJK words inside sentences
// into long compounds (e.g. 一个博客, 该不该开源TTB), so a query for 博客 /
// 开源 finds nothing even though the word is in the post title -- the
// title metadata is display-only, not searchable (verified), and the
// natural title duplicated into data-pagefind-body still segments the
// same way. Space-separated words ARE indexed as their own terms
// (verified in a controlled test site), so we duplicate the
// title/description/tags as segmented words, hidden.
//
// Two subtleties, both verified by measurement:
// 1. A 2-char query is segmented into single chars and ANDed, and a
//    char term is only dropped if it matches NO page. 博客 -> [博, 客]:
//    客 happens to exist as a term prefix on the M365 post, so it is
//    NOT dropped, and the AND fails (the remembering post has a 博-term
//    but no 客-term) -> 0 results. Same for 开源 ([开, 源], 源 exists
//    on edgeone-part1). Fix: emit each CJK word's characters as their
//    own terms, right after the word, so both chars match on this page.
// 2. Ranking: title keywords carry the title weight (10) and
//    description keywords the description weight (2), so a title match
//    still outranks a body/description mention. Excerpts stay natural
//    when the natural title/description matches (those divs are kept
//    alongside these); a keywords-only match shows the segmented words,
//    which read as space-separated words, not single chars, because the
//    word itself comes first.
//
// The segmenter is the pure-JS `segment` package (dictionary-based,
// no native build, works in the Cloudflare Pages build). Its output was
// checked against jieba on all 16 post titles: the words users search
// for (博客/京瓷/开源/打印机/数据清洗/日志/服务器/...) all come out
// right. Intl.Segmenter and tiny-segmenter were tried and rejected:
// Intl splits 博客/京瓷/开源 into single chars (and gives no words to
// show in excerpts), tiny-segmenter is Japanese-trained and
// mis-segments Chinese.
import Segment from "segment";

const segment = new Segment();
segment.useDefault();

const HAS_LETTER_OR_DIGIT = /[\p{L}\p{N}]/u;
const IS_CJK = /\p{Script=Han}/u;

/**
 * Segment texts into words, drop pure punctuation, dedupe, space-join.
 * Each multi-char CJK word is followed immediately by its characters
 * (see note 1 above), so a 2-char query matches both chars on this page.
 */
export function searchKeywords(
	...texts: Array<string | string[] | undefined>
): string {
	const seen = new Set<string>();
	const out: string[] = [];
	for (const text of texts) {
		const parts = Array.isArray(text) ? text : [text];
		for (const part of parts) {
			if (!part) continue;
			for (const { w } of segment.doSegment(part)) {
				const word = w.trim();
				if (!word || !HAS_LETTER_OR_DIGIT.test(word)) continue;
				if (seen.has(word)) continue;
				seen.add(word);
				out.push(word);
				if ([...word].length >= 2) {
					for (const ch of word) {
						if (!IS_CJK.test(ch)) continue;
						if (seen.has(ch)) continue;
						seen.add(ch);
						out.push(ch);
					}
				}
			}
		}
	}
	return out.join(" ");
}
