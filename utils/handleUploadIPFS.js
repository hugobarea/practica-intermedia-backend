const pinataUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS"

const uploadToPinata = async (fileBuffer, fileName) => {

    // Creamos el BLOB y el FormData
    let data = new FormData();
    const blob = new Blob([fileBuffer]);

    const metadata = JSON.stringify({
        name: fileName
    });

    // Opcion requerida por Pinata
    const options = JSON.stringify({
        cidVersion: 0,
    });

    // file, blob y nombre de blob
    data.append('file', blob, fileName);
    data.append('pinataMetadata', metadata);
    data.append('pinataOptions', options);

    try {
        const pinataApikey = process.env.PINATA_KEY;
        const pinataSecretApiKey = process.env.PINATA_SECRET;
        const response = await fetch(pinataUrl, {
            method: 'POST',
            body: data,
            headers: {
                'pinata_api_key': pinataApikey,
                'pinata_secret_api_key': pinataSecretApiKey
            }
        });

        if (!response.ok) {
            throw new Error(`Error al subir el arhivo: ${response.statusText}`);
        }
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.log('Error ', error);
        throw error;
    }
}

module.exports = { uploadToPinata };