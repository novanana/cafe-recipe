const MAX_SIZE = 800
const QUALITY = 0.8

/**
 * File → Canvas 리사이즈 → Blob (JPEG)
 * 긴 쪽을 MAX_SIZE 이하로 줄이고, 이미 작으면 그대로 반환
 */
export function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width >= height) {
          height = Math.round((height * MAX_SIZE) / width)
          width = MAX_SIZE
        } else {
          width = Math.round((width * MAX_SIZE) / height)
          height = MAX_SIZE
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('이미지 변환 실패'))),
        'image/jpeg',
        QUALITY,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('이미지 로드 실패'))
    }

    img.src = url
  })
}

/** Blob → 임시 ObjectURL. 사용 후 반드시 revokeObjectURL 호출 필요 */
export function blobToUrl(blob) {
  return URL.createObjectURL(blob)
}
