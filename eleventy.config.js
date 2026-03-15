const eleventySass = require("eleventy-sass");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventySass);
  
  // Passthrough JS and Assets
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");

  const isProduction = process.env.ELEVENTY_ENV === "production";

  return {
    pathPrefix: isProduction ? "/volo/" : "/",
    dir: {
      input: "src",
      output: "_site"
    }
  };
};
