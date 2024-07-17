const client = require("../.")
const config = client.config;
const { getTable, createEmbed,SendMsg} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'send_msg_Modal',
	permissions: [],
	run: async (client, interaction) => {
        const name = interaction.fields.getTextInputValue('text');

        SendMsg(interaction,name)
    }
};
