const client = require("../.")
const config = client.config;
const { getTable, createEmbed,Add_members} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'add_members_select',
	permissions: [],
	run: async (client, interaction) => {

        Add_members(interaction,interaction.values)

    }
};
