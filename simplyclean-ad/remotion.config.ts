import {Config} from '@remotion/cli/config';

/**
 * Render defaults tuned for this machine:
 *  8-core CPU, 15 GB RAM, Intel Haswell VAAPI (H.264 encode available).
 *
 * - jpeg @ 100 = ~2x faster than PNG with no visible loss on live-action footage.
 *   Switch to 'png' only if you need transparency in an intermediate render.
 * - crf 16 = visually lossless master; we re-encode down for delivery.
 */
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(100);
Config.setOverwriteOutput(true);
Config.setConcurrency(6);
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setChromiumDisableWebSecurity(false);
Config.setDelayRenderTimeoutInMilliseconds(120000);

/**
 * Hardware acceleration is deliberately OFF.
 *
 * This machine advertises H.264 encode through Intel Haswell VAAPI, but Remotion cannot
 * use it together with `crf` — VAAPI has no constant-quality mode, so with `if-possible`
 * it silently fell back to software on every render while logging a confusing
 * "Hardware accelerated encoding disabled" line. Quality-per-bit from 2013-era Quick Sync
 * is also worse than x264. Software x264 at crf 16 looks better and is reproducible.
 *
 * Measured on this machine: the full 1800-frame 1080p render takes ~4 minutes at
 * concurrency 6, which is acceptable. If that becomes a bottleneck, the lever to pull is
 * `crf` (18 renders noticeably faster for delivery-quality output), not hardware encode.
 */
Config.setHardwareAcceleration('disable');
