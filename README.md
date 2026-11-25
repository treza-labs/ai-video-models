# AI video models

The AI video and image models you can run on [Treza](https://www.trezalabs.com), with what each supports and what a clip costs. One table for video, one for images, and the same data as JSON you can fetch.

![Treza demo](https://raw.githubusercontent.com/treza-labs/treza-labs/main/assets/treza-demo.gif)

<!-- updated:start -->
Updated 2026-11-25: 31 video models and 69 image models.
<!-- updated:end -->

## Video models

Clip prices are what a clip costs when you leave the resolution unset, with sound where the model makes it. The Resolution column names that resolution first, then the highest the model offers; the JSON has the per-second rate at each one. A length in brackets is the one the model renders instead, because it does not make the length in the column header: Treza moves a request to the nearest length the model offers. "5 s min" means shorter clips are charged as 5 seconds. Audio "Yes" means the model makes its own sound and it can be turned off; "Always on" means it cannot.

<!-- video-models:start -->
| Model | Vendor | Lengths | Aspect ratios | Resolution | Audio | Image input | 5 s | 10 s | Per second | Link |
| --- | --- | --- | --- | --- | --- | --- | --: | --: | --: | --- |
| HappyHorse 1.0 | Alibaba | 3 to 15 s | 21:9 to 9:21 (7) | 1080p | Not listed | First frame, references | $1.19 | $2.38 | $0.238, 5 s min | — |
| HappyHorse 1.1 | Alibaba | 3 to 15 s | 21:9 to 9:21 (7) | 1080p | Always on | First frame, references | $0.91 | $1.82 | $0.182, 5 s min | [Try](https://www.trezalabs.com/models/happyhorse-1-1) |
| Wan 3.0 | Alibaba | 2 to 30 s | 21:9 to 9:16 (6) | 1080p | Yes | First + last frame | $1.40 | $2.80 | $0.280 | [Try](https://www.trezalabs.com/models/wan-3-0) |
| Wan 3.0 Prime | Alibaba | 2 to 30 s | 21:9 to 9:16 (6) | 1080p | Yes | First + last frame | $1.96 | $3.92 | $0.392, 5 s min | — |
| FLUX.3 Video | Black Forest Labs | 5 to 20 s | 21:9 to 9:21 (8) | 1080p, max 4K | Yes | First + last frame | $2.03 | $4.06 | $0.406 | [Try](https://www.trezalabs.com/models/flux-3-video) |
| Seedance 2.0 | ByteDance | 4 to 15 s | 21:9 to 9:21 (7) | 720p, max 4K | Yes | First + last frame, references | $1.12 | $2.24 | $0.224 | [Try](https://www.trezalabs.com/models/seedance-2-0) |
| Seedance 2.0 Fast | ByteDance | 4 to 15 s | 21:9 to 9:21 (7) | 720p | Yes | First + last frame, references | $0.86 | $1.72 | $0.172 | [Try](https://www.trezalabs.com/models/seedance-2-0-fast) |
| Seedance 2.0 Mini | ByteDance | 4 to 15 s | 21:9 to 9:21 (7) | 720p | Yes | First frame, references | $0.56 | $1.12 | $0.112 | [Try](https://www.trezalabs.com/models/seedance-2-0-mini) |
| Seedance 2.5 | ByteDance | 4 to 30 s | 21:9 to 9:16 (6) | 720p, max 1080p | Yes | First + last frame, references | $1.64 | $3.29 | $0.329 | [Try](https://www.trezalabs.com/models/seedance-2-5) |
| Seedance 2.5 Flash | ByteDance | 4 to 30 s | 21:9 to 9:16 (6) | 720p | Yes | First + last frame, references | $1.07 | $2.14 | $0.214 | [Try](https://www.trezalabs.com/models/seedance-2-5-flash) |
| Gemini Omni 1.1 Flash | Google | 3 to 10 s | 16:9, 9:16 | 720p, max 4K | Always on | First + last frame, references | $0.71 | $1.43 | $0.143 | [Try](https://www.trezalabs.com/models/gemini-omni-1-1-flash) |
| Gemini Omni 1.2 Flash | Google | 3 to 15 s | 16:9, 9:16 | 720p, max 4K | Always on | First + last frame, references | $0.49 | $0.98 | $0.098 | [Try](https://www.trezalabs.com/models/gemini-omni-1-2-flash) |
| Veo 3.1 | Google | 4, 6, 8 s | 16:9, 9:16 | 720p, max 4K | Yes | First + last frame | $3.36 (6 s) | $4.48 (8 s) | $0.560 | [Try](https://www.trezalabs.com/models/veo-3-1) |
| Veo 3.1 Fast | Google | 4, 6, 8 s | 16:9, 9:16 | 720p, max 4K | Yes | First + last frame | $0.84 (6 s) | $1.12 (8 s) | $0.140 | [Try](https://www.trezalabs.com/models/veo-3-1-fast) |
| Veo 3.1 Lite | Google | 4, 6, 8 s | 16:9, 9:16 | 720p, max 1080p | Yes | First + last frame | $0.42 (6 s) | $0.56 (8 s) | $0.070 | [Try](https://www.trezalabs.com/models/veo-3-1-lite) |
| HeyGen Video | HeyGen | 5 to 30 s | 21:9 to 9:16 (6) | 768p, max 2K | No | First frame, references | $0.70 | $1.40 | $0.140 | [Try](https://www.trezalabs.com/models/heygen-video) |
| Kling 3.0 Pro | Kuaishou | 3 to 15 s | 16:9, 1:1, 9:16 | 1080p | Yes | First + last frame | $1.18 | $2.35 | $0.235 | [Try](https://www.trezalabs.com/models/kling-3-0-pro) |
| Kling 3.0 Standard | Kuaishou | 3 to 15 s | 16:9, 1:1, 9:16 | 720p | Yes | First + last frame | $0.88 | $1.76 | $0.176, 5 s min | [Try](https://www.trezalabs.com/models/kling-3-0-standard) |
| Kling 4.0 | Kuaishou | 3 to 30 s | 21:9 to 9:16 (4) | 720p, max 1080p | No | First + last frame | $1.10 | $2.20 | $0.220 | [Try](https://www.trezalabs.com/models/kling-4-0) |
| Kling 4.0 Flash | Kuaishou | 3 to 20 s | 21:9 to 9:16 (4) | 720p | No | First frame | $0.66 | $1.32 | $0.132 | [Try](https://www.trezalabs.com/models/kling-4-0-flash) |
| Kling Video O1 | Kuaishou | 5, 10 s | 16:9, 1:1, 9:16 | 720p | Yes | First + last frame | $0.78 | $1.57 | $0.157 | [Try](https://www.trezalabs.com/models/kling-video-o1) |
| LTX-2.3 Fast | Lightricks | 6 to 20 s, every 2 | 16:9, 9:16 | 1080p, max 4K | Yes | First + last frame | $0.50 (6 s) | $0.84 | $0.084 | [Try](https://www.trezalabs.com/models/ltx-2-3-fast) |
| LTX-2.5 Fast | Lightricks | 6 to 20 s, every 2 | 16:9, 9:16 | 720p, max 4K | Yes | First + last frame | $0.76 (6 s) | $1.26 | $0.126 | [Try](https://www.trezalabs.com/models/ltx-2-5-fast) |
| Hailuo 2.3 | MiniMax | 6, 10 s | 16:9 | 1080p | No | First frame | $0.76 (6 s) | $1.26 | $0.126 | [Try](https://www.trezalabs.com/models/hailuo-2-3) |
| Hailuo 3 | MiniMax | 5 to 15 s | 21:9 to 9:16 (6) | 768p, max 4K | Always on | No | $0.42 | $0.84 | $0.084 | [Try](https://www.trezalabs.com/models/hailuo-3) |
| Hailuo 3 Max | MiniMax | 5 to 15 s | 21:9 to 9:16 (6) | 768p | No | First + last frame | $0.56 | $1.12 | $0.112 | [Try](https://www.trezalabs.com/models/hailuo-3-max) |
| Runway Gen-4.5 | Runway | 2 to 10 s | 16:9, 9:16 | 720p | No | First frame | $0.84 | $1.68 | $0.168 | [Try](https://www.trezalabs.com/models/runway-gen-4-5) |
| Mischief 1 | TBC | 3, 5 s | 16:9 | 480p, max 720p | No | Required: first frame | $0.03 | $0.03 (5 s) | $0.007 | [Try](https://www.trezalabs.com/models/mischief-1) |
| Grok Imagine | xAI | 1 to 15 s | 16:9 to 9:16 (7) | 480p, max 720p | Not listed | First frame, references | $0.35 | $0.70 | $0.070 | [Try](https://www.trezalabs.com/models/grok-imagine) |
| Grok Imagine 1.5 | xAI | 1 to 15 s | 5:2 to 9:16 (9) | 480p, max 1080p | Yes | First frame, references | $0.56 | $1.12 | $0.112 | [Try](https://www.trezalabs.com/models/grok-imagine-1-5) |
| Grok Imagine 1.5 Lite | xAI | 1 to 15 s | 5:2 to 9:16 (9) | 480p, max 1080p | Yes | First frame | $0.14 | $0.28 | $0.028 | [Try](https://www.trezalabs.com/models/grok-imagine-1-5-lite) |
<!-- video-models:end -->

## Image models

"Per image" is one image at the model's default settings. Where size, quality or shape changes the price, "Range by setting" gives the cheapest and dearest. Reference images are pictures the model edits or draws from.

<!-- image-models:start -->
| Model | Vendor | Aspect ratios | Max size | Reference images | Per image | Range by setting | Link |
| --- | --- | --- | --- | --- | --: | --: | --- |
| FLUX 3 Image Klein | Black Forest Labs | 21:9 to 9:21 (15), auto | 4K | Up to 10 | $0.01 | $0.01 to $0.05 | [Try](https://www.trezalabs.com/models/flux-3-image-klein) |
| FLUX.2 Flex | Black Forest Labs | 21:9 to 9:16 (8), auto | — | Up to 8 | $0.28 | $0.14 to $0.28 | — |
| FLUX.2 Klein 4B | Black Forest Labs | 21:9 to 9:16 (8), auto | — | Up to 4 | $0.02 | — | — |
| FLUX.2 Max | Black Forest Labs | 21:9 to 9:16 (8), auto | — | Up to 8 | $0.22 | $0.14 to $0.22 | — |
| FLUX.2 Pro | Black Forest Labs | 21:9 to 9:16 (9), auto | — | Up to 8 | $0.11 | $0.06 to $0.11 | [Try](https://www.trezalabs.com/models/flux-2-pro) |
| FLUX.3 Image | Black Forest Labs | 21:9 to 9:21 (15), auto | 4K | Up to 10 | $0.07 | $0.06 to $0.85 | [Try](https://www.trezalabs.com/models/flux-3-image) |
| Seedream 4.5 | ByteDance | 21:9 to 9:21 (17), auto | 4K | Up to 14 | $0.06 | — | [Try](https://www.trezalabs.com/models/seedream-4-5) |
| Seedream 5.0 Flash | ByteDance | 21:9 to 9:21 (17), auto | 2K | Up to 14 | $0.03 | — | [Try](https://www.trezalabs.com/models/seedream-5-0-flash) |
| Seedream 5.0 Lite | ByteDance | 21:9 to 9:21 (17), auto | 4K | Up to 14 | $0.05 | — | — |
| Seedream 5.0 Pro | ByteDance | 21:9 to 9:21 (17), auto | 2K | Up to 14 | $0.13 | — | [Try](https://www.trezalabs.com/models/seedream-5-0) |
| Seedream 5.5 | ByteDance | 21:9 to 9:21 (17), auto | 2K | Up to 10 | $0.05 | — | [Try](https://www.trezalabs.com/models/seedream-5-5) |
| Nano Banana (Gemini 2.5 Flash Image) | Google | 21:9 to 9:16 (10) | — | Up to 3 | $0.06 | — | [Try](https://www.trezalabs.com/models/gemini-2-5-flash-image) |
| Nano Banana 2 (Gemini 3.1 Flash Image Preview) | Google | 8:1 to 1:8 (14) | 4K | Up to 14 | $0.10 | $0.06 to $0.22 | — |
| Nano Banana 2 (Gemini 3.1 Flash Image) | Google | 8:1 to 1:8 (14) | 4K | Up to 14 | $0.10 | $0.06 to $0.22 | [Try](https://www.trezalabs.com/models/gemini-3-1-flash-image) |
| Nano Banana 2 Lite (Gemini 3.1 Flash Lite Image) | Google | 8:1 to 1:8 (14) | 1K | Up to 14 | $0.05 | — | — |
| Nano Banana 2.1 | Google | 8:1 to 1:8 (14) | 4K | Up to 14 | $0.05 | $0.05 to $0.16 | [Try](https://www.trezalabs.com/models/nano-banana-2-1) |
| Nano Banana Pro (Gemini 3 Pro Image Preview) | Google | 21:9 to 9:16 (10) | 2K | Up to 14 | $0.20 | — | — |
| Nano Banana Pro (Gemini 3 Pro Image) | Google | 21:9 to 9:16 (10) | 2K | Up to 14 | $0.20 | — | [Try](https://www.trezalabs.com/models/nano-banana-pro) |
| Krea 2 Large | Krea | 2.35:1 to 9:16 (9) | 1K | Up to 1 | $0.08 | — | [Try](https://www.trezalabs.com/models/krea-2) |
| Krea 2 Medium | Krea | 2.35:1 to 9:16 (9) | 1K | Up to 1 | $0.04 | — | — |
| Krea 2 Medium Turbo | Krea | 2.35:1 to 9:16 (9) | 1K | Up to 1 | $0.02 | — | — |
| Muse Image | Meta | — | — | Yes | $0.01 | — | [Try](https://www.trezalabs.com/models/muse-image) |
| MAI-Image-2.5 | Microsoft | 16:9 to 9:16 (7), auto | — | Up to 1 | $0.07 | — | — |
| MAI-Image-2.5 Pro | Microsoft | 16:9 to 9:16 (7), auto | — | Up to 1 | $0.16 | — | — |
| MAI-Image-2.6 | Microsoft | 16:9 to 9:16 (7), auto | — | Up to 5 | $0.06 | — | [Try](https://www.trezalabs.com/models/mai-image-2-6) |
| MAI-Image-2.6 Flash | Microsoft | 16:9 to 9:16 (7), auto | — | Up to 5 | $0.03 | — | — |
| MAI-Image-2.7 | Microsoft | 16:9 to 9:16 (7), auto | — | Up to 5 | $0.05 | — | [Try](https://www.trezalabs.com/models/mai-image-2-7) |
| MAI-Image-2.7 Flash | Microsoft | 16:9 to 9:16 (7), auto | — | Up to 5 | $0.02 | — | — |
| MiniMax H3 Image | MiniMax | 3:1 to 1:3 (23), auto | 4K | Up to 16 | $0.10 | $0.03 to $0.10 | [Try](https://www.trezalabs.com/models/minimax-h3-image) |
| MiniMax H3 Image Highspeed | MiniMax | 3:1 to 1:3 (23), auto | 4K | Up to 16 | $0.19 | $0.06 to $0.19 | — |
| GPT Image 1 | OpenAI | 3:2, 1:1, 2:3, auto | — | Up to 16 | $0.35 | $0.03 to $0.35 | — |
| GPT Image 1 Mini | OpenAI | 3:2, 1:1, 2:3, auto | — | Up to 16 | $0.07 | $0.01 to $0.07 | — |
| GPT Image 2 | OpenAI | 3:1 to 1:3 (14), auto | — | Up to 16 | $0.09 | $0.01 to $0.36 | [Try](https://www.trezalabs.com/models/gpt-image-2) |
| GPT Image 2.5 Flare | OpenAI | 3:1 to 1:3 (14), auto | — | Up to 16 | $0.09 | $0.01 to $0.36 | — |
| GPT Image 2.5 Sunburst | OpenAI | 3:1 to 1:3 (14), auto | — | Up to 16 | $0.09 | $0.01 to $0.36 | — |
| GPT Image 2.6 Flare | OpenAI | 3:1 to 1:3 (14), auto | — | Up to 16 | $0.09 | $0.04 to $0.36 | — |
| GPT Image 2.6 Sunburst | OpenAI | 3:1 to 1:3 (14), auto | — | Up to 16 | $0.09 | $0.04 to $0.36 | [Try](https://www.trezalabs.com/models/gpt-image-2-6) |
| GPT-5 Image | OpenAI | 3:2, 1:1, 2:3, auto | — | Up to 16 | $0.46 | — | — |
| GPT-5 Image Mini | OpenAI | 3:2, 1:1, 2:3, auto | — | Up to 16 | $0.10 | — | — |
| GPT-5.4 Image 2 | OpenAI | 21:9 to 9:16 (10), auto | — | Up to 16 | $0.39 | — | — |
| Qwen Image 2.1 Pro | Qwen | 4:1 to 1:4 (15) | 2K | Up to 10 | $0.06 | — | [Try](https://www.trezalabs.com/models/qwen-image-2-1) |
| Qwen Image 2.1 Turbo | Qwen | 4:1 to 1:4 (15) | 2K | Up to 10 | $0.03 | — | — |
| Qwen Image 3 | Qwen | 4:1 to 1:4 (13) | 2K | Up to 3 | $0.04 | — | [Try](https://www.trezalabs.com/models/qwen-image-3) |
| Qwen Image 3 Pro | Qwen | 4:1 to 1:4 (13) | 2K | Up to 3 | $0.11 | $0.06 to $0.11 | — |
| Recraft V3 | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.06 | — | — |
| Recraft V4 | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.06 | — | — |
| Recraft V4 Pro | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.35 | — | — |
| Recraft V4 Pro Vector | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.42 | — | — |
| Recraft V4 Styles | Recraft | 2:1 to 1:2 (11), auto | — | Required, up to 10 | $0.05 | — | — |
| Recraft V4 Styles Pro | Recraft | 2:1 to 1:2 (11), auto | — | Required, up to 10 | $0.14 | — | — |
| Recraft V4 Styles Pro Vector | Recraft | 2:1 to 1:2 (11), auto | — | Required, up to 10 | $0.17 | — | — |
| Recraft V4 Styles Vector | Recraft | 2:1 to 1:2 (11), auto | — | Required, up to 10 | $0.07 | — | — |
| Recraft V4 Vector | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.11 | — | — |
| Recraft V4.1 | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.05 | — | [Try](https://www.trezalabs.com/models/recraft-v4-1) |
| Recraft V4.1 Flash | Recraft | 2:1 to 1:2 (11), auto | — | No | $0.01 | — | — |
| Recraft V4.1 Flash V2 | Recraft | 2:1 to 1:2 (11), auto | — | No | $0.01 | — | [Try](https://www.trezalabs.com/models/recraft-v4-1-flash-v2) |
| Recraft V4.1 Pro | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.29 | — | — |
| Recraft V4.1 Pro Vector | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.42 | — | — |
| Recraft V4.1 Utility | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.05 | — | — |
| Recraft V4.1 Utility Pro | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.29 | — | — |
| Recraft V4.1 Vector | Recraft | 2:1 to 1:2 (11), auto | — | Up to 1 | $0.11 | — | — |
| Riverflow V2 Fast | Sourceful | 21:9 to 9:16 (8), auto | 4K | Up to 4 | $0.06 | $0.03 to $0.06 | — |
| Riverflow V2 Pro | Sourceful | 21:9 to 9:16 (8), auto | 4K | Up to 10 | $0.21 | $0.21 to $0.46 | — |
| Riverflow V2.5 Fast | Sourceful | 21:9 to 9:16 (8), auto | 2K | Up to 4 | $0.05 | $0.04 to $0.05 | — |
| Riverflow V2.5 Pro | Sourceful | 21:9 to 9:16 (8), auto | 4K | Up to 10 | $0.41 | $0.35 to $0.46 | [Try](https://www.trezalabs.com/models/riverflow-2-5) |
| Riverflow V2.6 Pro | Sourceful | 21:9 to 9:16 (10), auto | 4K | Up to 10 | $0.25 | $0.22 to $0.28 | [Try](https://www.trezalabs.com/models/riverflow-2-6-pro) |
| Hy Image 3.5 Preview | Tencent | 4:1 to 1:4 (13) | 4K | Up to 20 | $0.03 | $0.03 to $0.04 | [Try](https://www.trezalabs.com/models/hy-image-3-5) |
| HY-World 2.1 Panorama | Tencent | — | — | No | $1.08 | — | [Try](https://www.trezalabs.com/models/hy-world-2-1-panorama) |
| Grok Imagine Image 2.0 | xAI | 5:2 to 9:20 (15), auto | 2K | Up to 5 | $0.08 | $0.08 to $0.11 | [Try](https://www.trezalabs.com/models/grok-imagine-image-2-0) |
<!-- image-models:end -->

## Use the data

The tables come from two JSON files, regenerated together:

- Video: https://raw.githubusercontent.com/treza-labs/ai-video-models/main/data/video-models.json
- Images: https://raw.githubusercontent.com/treza-labs/ai-video-models/main/data/image-models.json

Each file has `updated` (the day its models last changed), `currency`, `count` and `models`. A video model carries its clip lengths, aspect ratios, resolutions, audio, whether it takes a first frame, a last frame or reference images, and `price`: the rate per second, the rate at each resolution, and `clips`, the price of one clip at every length it renders. `price` is `null` for a model Treza quotes per run instead. The `id` is stable and matches the model's Treza page where it has one. [`data/schema.json`](data/schema.json) describes every field.

```sh
# 10 second clips under $1, cheapest first
curl -s https://raw.githubusercontent.com/treza-labs/ai-video-models/main/data/video-models.json |
  jq -r '[.models[] | select(.price.clips["10"] != null and .price.clips["10"] < 1)]
         | sort_by(.price.clips["10"]) | .[] | "\(.price.clips["10"])  \(.name)"'
```

```js
const res = await fetch('https://raw.githubusercontent.com/treza-labs/ai-video-models/main/data/video-models.json');
const { models } = await res.json();
const withAudio = models.filter((m) => m.audio === 'optional' || m.audio === 'always');
```

## How prices are set

These are the prices Treza charges, in US dollars. Every run is quoted per request before anything is charged, and a failed generation costs nothing. Some models add a small charge for each input or reference image; the JSON lists it as `per_input_image` and `per_reference_image`. Prices change from time to time, and this table follows on its next refresh.

## How often it refreshes

Daily. Treza's model watch regenerates the files from Treza's model catalog and commits only when a model, a spec or a price changed, so the commit history doubles as a changelog.

## Try a model

Open the model's Treza page from the Link column. It runs the model in chat or on Treza's canvas and quotes the clip before you pay. Credits are prepaid, with no subscription. To call a model from code, build a pipeline with it on Treza and publish it as an API.

## License

The code in `scripts/` and `test/` is under the [MIT license](LICENSE). The data in `data/` and the tables above are under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): use them anywhere, with credit to Treza and a link to this repository.
