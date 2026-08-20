const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.82;

/**
 * 업로드한 사진을 긴 변 기준 maxDimension 이하로 줄여 JPEG data URL로 바꾼다.
 *
 * 원본 data URL은 최대 10MB까지 허용되는데, 그대로 쓰면
 *  - Edge Function을 거쳐 OpenAI로 수 MB짜리 base64가 그대로 올라가고
 *  - closet_items.image_url(text)에 그 문자열이 통째로 저장된다.
 * 둘 다 실패하기 쉬운 크기라, 저장/전송 전에 한 번 줄인다.
 *
 * 변환에 실패하면 원본을 그대로 돌려준다(업로드 자체를 막지 않는다).
 */
export async function downscaleImage(dataUrl: string, maxDimension = MAX_DIMENSION): Promise<string> {
  try {
    const image = await loadImage(dataUrl);
    const longestSide = Math.max(image.width, image.height);
    if (!longestSide) return dataUrl;

    const scale = Math.min(1, maxDimension / longestSide);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return dataUrl;

    // 투명 PNG를 JPEG로 바꾸면 배경이 검게 되므로 흰색으로 먼저 채운다.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const resized = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    return resized.length < dataUrl.length ? resized : dataUrl;
  } catch (err) {
    console.warn("[Cadi] 이미지 리사이즈에 실패해 원본을 사용합니다:", err);
    return dataUrl;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 디코딩하지 못했습니다."));
    image.src = src;
  });
}
