import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) // inject the pokemon model
    private readonly pokemonModel = Model<Pokemon>, // array of pokemons
  ) {}
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase(); // convert name to lowercase

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto); // create a new pokemon
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  findAll() {
    return this.pokemonModel.find();
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if (!pokemon && isValidObjectId(term))
      pokemon = await this.pokemonModel.findById(term);

    if (!pokemon)
      pokemon = await this.pokemonModel.findOne({
        name: term.toLowerCase().trim(),
      });
    if (!pokemon)
      throw new BadRequestException(`Pokemon with id ${term} not found`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemonToUpdate = await this.findOne(term);
    if (!pokemonToUpdate) {
      throw new BadRequestException(`Pokemon with id ${term} not found`);
    }
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemonToUpdate.updateOne(updatePokemonDto, {
        new: true,
      });
      return { ...pokemonToUpdate.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();

    // const result = await this.pokemonModel.findByIdAndDelete(id); // delete the pokemon by id
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id }); // delete the pokemon by id
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }
  }

  private handleExceptions(error: any) {
    if (error.code === 11000)
      throw new BadRequestException(
        `Pokemon already exists ${JSON.stringify(error.keyValue)}`,
      );
    console.log('error', error);
    throw new InternalServerErrorException(
      `Can't update Pokemon - Check server logs`,
    );
  }
}
