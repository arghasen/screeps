import { Process } from "../os/process";
import { logger } from "../utils/logger";

/**
 * City is the lowest level of an empire and is responsible for individual cities
 */
export class City extends Process {
  protected className = "city";
  private citydata?: CityData;
  public main() {
    this.citydata = this.data as CityData;
    logger.info(`${this.className}: Starting city for ${this.citydata.roomName}`);
    this.launchChildProcess(`infrastructure-${this.citydata.roomName}`, "infrastructure", {});
  }
}
