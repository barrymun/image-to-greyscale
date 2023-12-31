import { convertImageToCanvas, getImageTargetFileList } from "image-ops";

import { blueCoefficient, greenCoefficient, redCoefficient } from "utils/constants";
import { colourCanvas, convertBtn, downloadLink, greyscaleCanvas, greyscaleImg, greyscaleInput } from "utils/elements";
import { displayFileName, toggleElementVisibility } from "utils/helpers";
import { ImageExtension, ImageType } from "utils/types";

export class GreyscaleConverter {
  private imageExtension: string | undefined;

  public getImageExtension = (): string | undefined => this.imageExtension;

  private setImageExtension = (imageExtension: string): void => {
    this.imageExtension = imageExtension;
  };

  constructor() {
    this.bindListeners();
  }

  private handleChange = (event: Event): void => {
    displayFileName(event);

    const files = getImageTargetFileList(event);
    if (!files) return;

    switch (files[0].type) {
      case ImageType.Png:
        this.setImageExtension(ImageExtension.Png);
        break;
      case ImageType.Jpeg:
        this.setImageExtension(ImageExtension.Jpeg);
        break;
      default:
        break;
    }

    if (!this.getImageExtension()) {
      alert("Invalid image type");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      greyscaleImg.src = reader.result as string;
    };
    reader.readAsDataURL(files[0]);
  };

  private clearCanvas = ({ targetCanvas }: { targetCanvas: HTMLCanvasElement }): void => {
    // get canvas context
    const ctx = targetCanvas.getContext("2d")!;

    // clear canvas
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

    // clear path
    ctx.beginPath();
  };

  private copyCanvas = ({
    sourceCanvas,
    targetCanvas,
  }: {
    sourceCanvas: HTMLCanvasElement;
    targetCanvas: HTMLCanvasElement;
  }) => {
    // get canvas context
    const targetCtx = targetCanvas.getContext("2d")!;

    // source and target canvas dimensions must match
    targetCanvas.width = sourceCanvas.width;
    targetCanvas.height = sourceCanvas.height;

    // copy source canvas onto target canvas
    targetCtx.drawImage(sourceCanvas, 0, 0);
  };

  private convertToGreyscale = ({
    sourceCanvas,
    targetCanvas,
  }: {
    sourceCanvas: HTMLCanvasElement;
    targetCanvas: HTMLCanvasElement;
  }): void => {
    // get canvas context
    const targetCtx = targetCanvas.getContext("2d")!;

    this.copyCanvas({
      sourceCanvas,
      targetCanvas,
    });

    // Get image data
    const imageData = targetCtx.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
    const data = imageData.data;

    // Convert each pixel to greyscale
    for (let i = 0; i < data.length; i += 4) {
      const grey = data[i] * redCoefficient + data[i + 1] * greenCoefficient + data[i + 2] * blueCoefficient;
      data[i] = grey; // red
      data[i + 1] = grey; // green
      data[i + 2] = grey; // blue
    }

    // Put modified image data back onto canvas
    targetCtx.putImageData(imageData, 0, 0);
  };

  private handleImageLoad = (_event: Event): void => {
    toggleElementVisibility({
      el: downloadLink,
      isVisible: false,
    });

    this.clearCanvas({
      targetCanvas: colourCanvas,
    });
    this.clearCanvas({
      targetCanvas: greyscaleCanvas,
    });

    const newCanvas = convertImageToCanvas(greyscaleImg);
    this.copyCanvas({
      sourceCanvas: newCanvas,
      targetCanvas: colourCanvas,
    });

    toggleElementVisibility({
      el: convertBtn,
      isVisible: true,
    });
  };

  private handleConvertBtnClick = (): void => {
    this.convertToGreyscale({
      sourceCanvas: colourCanvas,
      targetCanvas: greyscaleCanvas,
    });

    toggleElementVisibility({
      el: downloadLink,
      isVisible: true,
    });
  };

  private handleDownload = (): void => {
    if (!this.getImageExtension()) return;

    downloadLink.href = greyscaleCanvas.toDataURL(`image/${this.getImageExtension()}`);
    downloadLink.download = `greyscale.${this.getImageExtension()}`;
  };

  private bindListeners = (): void => {
    greyscaleInput.addEventListener("change", this.handleChange);
    greyscaleImg.addEventListener("load", this.handleImageLoad);
    convertBtn.addEventListener("click", this.handleConvertBtnClick);
    downloadLink.addEventListener("click", this.handleDownload);

    window.addEventListener("unload", this.handleUnload);
  };

  private handleUnload = (): void => {
    greyscaleInput.removeEventListener("change", this.handleChange);
    greyscaleImg.removeEventListener("load", this.handleImageLoad);
    convertBtn.removeEventListener("click", this.handleConvertBtnClick);
    downloadLink.removeEventListener("click", this.handleDownload);

    window.removeEventListener("unload", this.handleUnload);
  };
}
