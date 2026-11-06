declare module "segment" {
	class Segment {
		useDefault(): void;
		doSegment(text: string): Array<{ w: string; p: number }>;
	}
	export default Segment;
}
