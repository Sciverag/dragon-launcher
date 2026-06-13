import axios from "axios";

export async function getGameDetails(gameId: string | number) {
    const res = await axios.get(
        `/steam-api/api/appdetails?appids=${gameId}`
    );


    return res.data[gameId].data;
}

export async function getGameAssets(gameId: string | number) {
    const res = await axios.get(
        `http://localhost:4500/assets/steam/${gameId}`
    )

    return res.data;
}