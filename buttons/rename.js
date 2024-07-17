const client = require("../.")
const config = client.config;
const { getTable, createEmbed} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder, ModalBuilder ,TextInputStyle,TextInputBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'rename',
	permissions: [],
	run: async (client, interaction) => {
		
        const modal = new ModalBuilder()
			.setCustomId('rename_Modal')
			.setTitle('تغير اسم التذكرة');
        

            const name = new TextInputBuilder()
			.setCustomId('name')
			.setLabel("اسم التذكرة الجديد؟")
            .setPlaceholder('لكتابه رقم التذكرة اكتب {id}')

			.setStyle(TextInputStyle.Short)
            .setRequired(true);



            const nameq = new ActionRowBuilder().addComponents(name);
            modal.addComponents(nameq);

            await interaction.showModal(modal);

	}
};
