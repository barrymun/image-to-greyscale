import { blueCoefficient, greenCoefficient, redCoefficient } from "utils/constants";
import { canvas, greyscaleCanvas, greyscaleImg, greyscaleInput } from "utils/elements";
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

  private convertToGreyscale = ({
    sourceCanvas,
    targetCanvas,
  }: {
    sourceCanvas: HTMLCanvasElement;
    targetCanvas: HTMLCanvasElement;
  }): void => {
    // get canvas context
    const targetCtx = targetCanvas.getContext("2d")!;

    // source and target canvas dimensions must match
    targetCanvas.width = sourceCanvas.width;
    targetCanvas.height = sourceCanvas.height;

    // copy source canvas onto target canvas
    targetCtx.drawImage(sourceCanvas, 0, 0);

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

  private convertImageToCanvas = ({
    img,
    targetCanvas,
  }: {
    img: HTMLImageElement;
    targetCanvas: HTMLCanvasElement;
  }): void => {
    // Get canvas context
    const ctx = targetCanvas.getContext("2d")!;

    // Set canvas dimensions to match the image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image onto the canvas
    ctx.drawImage(img, 0, 0, img.width, img.height);
  };

  private resizeCanvas = ({
    targetCanvas,
    newWidth,
    newHeight,
  }: {
    targetCanvas: HTMLCanvasElement;
    newWidth: number;
    newHeight: number;
  }): void => {
    // Get canvas context
    const ctx = targetCanvas.getContext("2d")!;

    // Step 1: Create a temporary canvas and context.
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCanvas.width = targetCanvas.width;
    tempCanvas.height = targetCanvas.height;

    // Copy the content of the original canvas onto the temporary canvas.
    tempCtx.drawImage(targetCanvas, 0, 0);

    // Step 2: Resize the original canvas.
    targetCanvas.width = newWidth;
    targetCanvas.height = newHeight;

    // Step 3: Draw the content of the temporary canvas back onto the resized original canvas.
    ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, newWidth, newHeight);
  };

  private handleImageLoad = (_event: Event): void => {
    this.convertImageToCanvas({
      img: greyscaleImg,
      targetCanvas: canvas,
    });
    this.resizeCanvas({
      targetCanvas: canvas,
      newWidth: canvas.width * 0.5,
      newHeight: canvas.height * 0.5,
    });
    this.convertToGreyscale({
      sourceCanvas: canvas,
      targetCanvas: greyscaleCanvas,
    });
  };

  private handleChange = (event: Event): void => {
    if (!(event.target instanceof HTMLInputElement)) return;

    if (!event.target.files) return;

    switch (event.target.files[0].type) {
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
    reader.readAsDataURL(event.target.files[0]);
  };

  private bindListeners = (): void => {
    greyscaleInput.addEventListener("change", this.handleChange);
    greyscaleImg.addEventListener("load", this.handleImageLoad);

    window.addEventListener("unload", this.handleUnload);
  };

  private handleUnload = (): void => {
    greyscaleInput.removeEventListener("change", this.handleChange);
    greyscaleImg.removeEventListener("load", this.handleImageLoad);

    window.removeEventListener("unload", this.handleUnload);
  };
}
