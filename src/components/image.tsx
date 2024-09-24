import { animated, useSpring } from '@react-spring/web'
import ky, { DownloadProgress } from 'ky'
import { useEffect, useState } from 'react'
import { Progress } from './ui/progress'

const Image = ({ src, className }: { src: string; className?: string }) => {
  const [data, setData] = useState('')

  const [imageSpring, imageSpringApi] = useSpring(() => ({
    opacity: 0,
    scale: 0.9,
    config: {
      tension: 400,
    },
  }))

  const [progress, setProgress] = useState<DownloadProgress>({
    percent: 0,
    totalBytes: 0,
    transferredBytes: 0,
  })

  useEffect(() => {
    const setImage = async () => {
      const downloadStart = Date.now()
      const res = await ky(src, {
        onDownloadProgress: (progress) => {
          if (
            progress.percent === 1 ||
            progress.transferredBytes === progress.totalBytes
          ) {
            const downloadEnd = Date.now()

            if (downloadEnd - downloadStart > 500) {
              imageSpringApi.start({
                opacity: 1,
                scale: 1,
              })
            } else {
              imageSpringApi.set({
                opacity: 1,
                scale: 1,
              })
            }
          }
          setProgress(progress)
        },
      })

      setData(window.URL.createObjectURL(await res.blob()))
    }

    setImage()
  }, [])

  if (progress.percent < 1)
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-white">
        <Progress value={progress.percent * 100} />
      </div>
    )

  return <animated.img style={imageSpring} className={className} src={data} />
}

export default Image
