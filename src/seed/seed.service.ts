import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapter/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel = Model<Pokemon>,
    // private readonly pokemonService: PokemonService,

    private readonly http: AxiosAdapter,
  ) {}

  private readonly axios: AxiosInstance = axios;

  async exectuteSeed() {
    await this.pokemonModel.deleteMany({});
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );

    const pokemonsToInsert: { name: string; no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      // this.pokemonService.create({ name, no: +url.split('/').slice(-2)[0] });

      // this.pokemonModel.create({ name, no: +url.split('/').slice(-2)[0] });

      pokemonsToInsert.push({ name, no: +url.split('/').slice(-2)[0] });
    });

    await this.pokemonModel.insertMany(pokemonsToInsert);
    return 'Seed executed';
  }
}
