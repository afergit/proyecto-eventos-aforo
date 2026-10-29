import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
  type BlockBlobUploadOptions
} from '@azure/storage-blob';
import { Logger } from '../logging/logger';

export interface StorageConfig {
  accountName: string;
  accountKey: string;
  containerName: string;
}

export interface UploadResult {
  blobName: string;
  url: string;
}

export class AzureBlobStorageService {
  private blobServiceClient?: BlobServiceClient;
  private sharedKeyCredential?: StorageSharedKeyCredential;
  private containerName: string;
  private accountName: string;
  private isConfigured: boolean = false;

  constructor(config?: Partial<StorageConfig>) {
    this.accountName = config?.accountName || process.env.AZURE_STORAGE_ACCOUNT || '';
    const accountKey = config?.accountKey || process.env.AZURE_STORAGE_ACCESS_KEY || '';
    this.containerName = config?.containerName || process.env.AZURE_STORAGE_REPORTS_CONTAINER || 'event-attachments';

    if (this.accountName && accountKey) {
      this.sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, accountKey);
      this.blobServiceClient = new BlobServiceClient(
        `https://${this.accountName}.blob.core.windows.net`,
        this.sharedKeyCredential
      );
      this.isConfigured = true;
    } else {
      Logger.warn('Azure Blob Storage credentials no configuradas. Operando en modo mock/local.');
    }
  }

  /**
   * Genera un enlace temporal con SAS Token (Shared Access Signature) de sólo lectura.
   * Mitiga el riesgo de exponer credenciales maestras y previene descargas no autorizadas.
   */
  generateDownloadUrl(blobName: string, durationMinutes: number = 60): string {
    if (!this.isConfigured || !this.sharedKeyCredential) {
      // Mock URL para entornos de pruebas locales
      return `https://mock-storage.local/${this.containerName}/${blobName}?sas=mock_token_exp_${Date.now() + durationMinutes * 60000}`;
    }

    const now = new Date();
    const startsOn = new Date(now.valueOf() - 5 * 60 * 1000); // 5 minutos de holgura por desfase de reloj (clock skew)
    const expiresOn = new Date(now.valueOf() + durationMinutes * 60 * 1000);

    const sasToken = generateBlobSASQueryParameters({
      containerName: this.containerName,
      blobName,
      permissions: BlobSASPermissions.parse('r'), // Solo lectura
      startsOn,
      expiresOn,
      protocol: SASProtocol.Https
    }, this.sharedKeyCredential).toString();

    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${sasToken}`;
  }

  /**
   * Sube un buffer de archivo al contenedor de Azure Blob Storage de forma asíncrona
   */
  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    originalFileName: string,
    contentType: string = 'application/pdf'
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobName = `${timestamp}-${sanitizedFileName}`;

    if (!this.isConfigured || !this.blobServiceClient) {
      Logger.info(`[Mock Storage] Archivo ${blobName} recibido en memoria.`);
      return {
        blobName,
        url: this.generateDownloadUrl(blobName)
      };
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const options: BlockBlobUploadOptions = {
        blobHTTPHeaders: {
          blobContentType: contentType
        }
      };

      await blockBlobClient.uploadData(fileBuffer, options);
      const secureDownloadUrl = this.generateDownloadUrl(blobName);

      Logger.info(`Archivo subido exitosamente a Azure Blob Storage: ${blobName}`);
      return {
        blobName,
        url: secureDownloadUrl
      };
    } catch (error) {
      Logger.error('Error al subir archivo a Azure Blob Storage', {
        blobName,
        error: error instanceof Error ? error.message : 'Unknown storage error'
      });
      throw error;
    }
  }
}
