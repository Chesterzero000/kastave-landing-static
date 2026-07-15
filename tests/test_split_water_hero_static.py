import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class SplitWaterHeroStaticTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / "index.html").read_text()
        cls.css = (ROOT / "styles.css").read_text()
        cls.js = (ROOT / "script.js").read_text()

    def test_homepage_uses_split_water_hero_instead_of_carousel(self):
        self.assertIn("data-split-water-hero", self.html)
        self.assertIn('class="split-water-hero"', self.html)
        self.assertNotIn('class="slideshow"', self.html)
        self.assertNotIn('class="slider-controls"', self.html)

    def test_hero_has_accessible_copy_and_ctas(self):
        self.assertIn("Map the Water Before You Cast", self.html)
        self.assertIn("Kastave scouts freshwater structure", self.html)
        self.assertRegex(self.html, r'<a[^>]+class="[^"]*button primary[^"]*"[^>]+href="#reserve"')
        self.assertIn("Reserve for $1", self.html)
        self.assertIn("See the scan workflow", self.html)
        self.assertIn('href="#sonar-reconstruction"', self.html)

    def test_hero_canvas_is_decorative_and_has_fallback_layers(self):
        self.assertRegex(
            self.html,
            r'<canvas[^>]+class="split-water-hero__canvas"[^>]+aria-hidden="true"',
        )
        for marker in [
            "split-water-hero__surface",
            "split-water-hero__underwater",
            "split-water-hero__terrain",
            "split-water-hero__product",
            "split-water-hero__waterline",
        ]:
            self.assertIn(marker, self.html)

    def test_css_defines_responsive_and_reduced_motion_rules(self):
        for selector in [
            ".split-water-hero",
            ".split-water-hero__scene",
            ".split-water-hero__canvas",
            ".split-water-hero__terrain",
            ".split-water-hero__proof",
        ]:
            self.assertIn(selector, self.css)
        self.assertIn("@media (max-width: 620px)", self.css)
        self.assertIn("prefers-reduced-motion: reduce", self.css)

    def test_javascript_initializes_canvas_animation_safely(self):
        for marker in [
            "function initSplitWaterHero()",
            "requestAnimationFrame",
            "IntersectionObserver",
            "devicePixelRatio",
            "drawSplitWaterHeroFrame",
        ]:
            self.assertIn(marker, self.js)
        self.assertRegex(self.js, r"Math\.min\(window\.devicePixelRatio \|\| 1, 2\)")


if __name__ == "__main__":
    unittest.main()
